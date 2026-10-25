import { AutomationAction } from "@prisma/client";
import { ExecutionContext } from "./types";
import { sendNotification } from "../services/notificationService";
import { sendAutoReply } from "../services/emailService";
import { createCalendarEvent } from "../services/calendarService";
import { prisma } from "../utils/prisma";
import { generateReply } from "../ai/aiService";

interface ActionRunResult {
  actionType: string;
  ok: boolean;
  detail: string;
}

function fillTemplate(template: string, context: ExecutionContext): string {
  return template.replace(/{{\s*(\w+)\s*}}/g, (_match, key: string) => String(context[key] ?? ""));
}

// Runs a single action against the execution context. Every action is
// independent and reports its own success/failure so one bad action doesn't
// silently swallow the others - actionService.runAll aggregates the results.
async function runAction(userId: string, action: Pick<AutomationAction, "type" | "config">, context: ExecutionContext): Promise<ActionRunResult> {
  const config = (action.config as Record<string, unknown>) ?? {};

  switch (action.type) {
    case "MARK_IMPORTANT":
      context.importance = "high";
      return { actionType: action.type, ok: true, detail: "Marked email as important" };

    case "CATEGORIZE_EMAIL":
      context.category = context.category ?? "Uncategorized";
      return { actionType: action.type, ok: true, detail: `Categorized as ${context.category}` };

    case "SEND_NOTIFICATION": {
      await sendNotification({
        userId,
        title: "AutoFlow automation triggered",
        message: config.messageTemplate ? fillTemplate(String(config.messageTemplate), context) : `New activity: ${context.subject ?? context.eventTitle ?? "event"}`,
      });
      return { actionType: action.type, ok: true, detail: "In-app notification sent" };
    }

    case "TELEGRAM_NOTIFICATION": {
      await sendNotification({
        userId,
        channel: "TELEGRAM",
        telegramLabel: String(config.telegramLabel ?? "connected account"),
        title: "AutoFlow",
        message: config.messageTemplate ? fillTemplate(String(config.messageTemplate), context) : `New email from ${context.sender}: ${context.subject}`,
      });
      return { actionType: action.type, ok: true, detail: "Telegram notification sent" };
    }

    case "CREATE_CALENDAR_EVENT": {
      const startsAt = new Date(Date.now() + 1000 * 60 * 30).toISOString();
      const endsAt = new Date(Date.now() + 1000 * 60 * 90).toISOString();
      const event = await createCalendarEvent(String(config.title ?? context.subject ?? "AutoFlow event"), startsAt, endsAt);
      return { actionType: action.type, ok: true, detail: `Created calendar event "${event.title}"` };
    }

    case "AUTO_REPLY": {
      const body = await generateReply({ subject: context.subject ?? "", snippet: context.snippet ?? "" });
      await sendAutoReply("GMAIL", String(context.emailId ?? "unknown"), body);
      return { actionType: action.type, ok: true, detail: "Auto-reply sent" };
    }

    case "ENABLE_FOCUS_MODE": {
      await prisma.focusSession.updateMany({ where: { userId, isActive: true }, data: { isActive: false, endedAt: new Date() } });
      await prisma.focusSession.create({
        data: { userId, isActive: true, reason: context.eventTitle ? `Calendar: ${context.eventTitle}` : "Automation triggered" },
      });
      return { actionType: action.type, ok: true, detail: "Focus Mode enabled" };
    }

    case "SAVE_LOG":
      await prisma.activityLog.create({
        data: { userId, type: "automation.action.save_log", message: `Logged: ${context.subject ?? context.eventTitle ?? "event"}` },
      });
      return { actionType: action.type, ok: true, detail: "Saved to activity log" };

    default:
      return { actionType: action.type, ok: false, detail: `Unknown action type: ${action.type}` };
  }
}

export async function runActions(userId: string, actions: Pick<AutomationAction, "type" | "config" | "order">[], context: ExecutionContext): Promise<ActionRunResult[]> {
  const ordered = [...actions].sort((a, b) => a.order - b.order);
  const results: ActionRunResult[] = [];
  for (const action of ordered) {
    // Sequential on purpose: later actions (e.g. AUTO_REPLY) can depend on
    // context mutated by earlier ones (e.g. MARK_IMPORTANT, CATEGORIZE_EMAIL).
    results.push(await runAction(userId, action, context));
  }
  return results;
}
