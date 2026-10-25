import { AutomationTrigger } from "@prisma/client";
import { ExecutionContext } from "./types";

// Decides whether a given trigger definition matches the incoming context.
// In this MVP, triggers are evaluated on-demand (manual run, or the mock
// scheduler in server.ts) rather than via real webhooks - see integrations/
// for where real Gmail/Calendar push notifications would plug in later.
export function matchesTrigger(trigger: Pick<AutomationTrigger, "type" | "config">, context: ExecutionContext): boolean {
  const config = (trigger.config as Record<string, unknown>) ?? {};

  switch (trigger.type) {
    case "NEW_EMAIL":
      return Boolean(context.subject);
    case "EMAIL_FROM_SENDER": {
      const sender = String(config.sender ?? "").toLowerCase();
      return Boolean(context.sender) && (!sender || context.sender!.toLowerCase().includes(sender));
    }
    case "NEW_CALENDAR_EVENT":
      return Boolean(context.eventTitle);
    case "SCHEDULED_TIME":
      return true; // scheduled triggers fire purely on time, handled by the caller
    case "KEYWORD_DETECTED": {
      const keyword = String(config.keyword ?? "").toLowerCase();
      const haystack = `${context.subject ?? ""} ${context.snippet ?? ""}`.toLowerCase();
      return !keyword || haystack.includes(keyword);
    }
    default:
      return false;
  }
}
