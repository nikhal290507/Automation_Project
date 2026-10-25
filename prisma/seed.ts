import { PrismaClient, RoleType, TriggerType, ActionType, ConditionField, ConditionOperator } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // --- Demo user -----------------------------------------------------------
  const passwordHash = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: "demo@autoflow.app" },
    update: { passwordHash, onboarded: true },
    create: {
      email: "demo@autoflow.app",
      passwordHash,
      name: "Alex Rivera",
      roleType: RoleType.STUDENT,
      onboarded: true,
      preferences: { focusHours: "09:00-12:00", digestTime: "08:00" },
      subscription: { create: { plan: "FREE", status: "ACTIVE" } },
      connectedApps: {
        create: [
          { provider: "GMAIL", status: "MOCK", accountLabel: "alex.rivera@gmail.com" },
          { provider: "GOOGLE_CALENDAR", status: "MOCK", accountLabel: "alex.rivera@gmail.com" },
          { provider: "TELEGRAM", status: "MOCK", accountLabel: "@alexrivera" },
        ],
      },
    },
  });

  // --- Sample automation -----------------------------------------------------
  const automation = await prisma.automation.create({
    data: {
      userId: user.id,
      name: "Professor emails to Telegram",
      description: "Flags emails from professors as important and pings me on Telegram.",
      isEnabled: true,
      lastExecuted: new Date(),
      triggers: { create: [{ type: TriggerType.EMAIL_FROM_SENDER, config: { sender: "professor" } }] },
      conditions: {
        create: [{ field: ConditionField.SENDER, operator: ConditionOperator.CONTAINS, value: "professor" }],
      },
      actions: {
        create: [
          { type: ActionType.MARK_IMPORTANT, order: 0 },
          { type: ActionType.TELEGRAM_NOTIFICATION, order: 1, config: { messageTemplate: "New email from {{sender}}: {{subject}}" } },
        ],
      },
    },
  });

  await prisma.automationExecution.create({
    data: {
      automationId: automation.id,
      userId: user.id,
      status: "SUCCESS",
      resultSummary: "Marked important, sent Telegram notification",
      durationMs: 420,
    },
  });

  await prisma.activityLog.createMany({
    data: [
      { userId: user.id, type: "automation.executed", message: "Professor emails to Telegram ran successfully" },
      { userId: user.id, type: "app.connected", message: "Connected Gmail (mock)" },
      { userId: user.id, type: "focus.enabled", message: "Focus Mode enabled for Sprint planning" },
    ],
  });

  // --- Templates --------------------------------------------------------------
  await prisma.template.createMany({
    data: [
      {
        name: "Important email to Telegram",
        description: "Detects important emails and pings you instantly on Telegram.",
        roleType: RoleType.CUSTOM,
        isPremium: false,
        triggerType: TriggerType.NEW_EMAIL,
        conditions: [{ field: "IMPORTANCE", operator: "EQUALS", value: "high" }],
        actions: [
          { type: "MARK_IMPORTANT", order: 0 },
          { type: "TELEGRAM_NOTIFICATION", order: 1 },
        ],
      },
      {
        name: "Meeting starts -> Focus Mode",
        description: "Automatically silences notifications when a calendar meeting begins.",
        roleType: RoleType.CORPORATE_EMPLOYEE,
        isPremium: false,
        triggerType: TriggerType.NEW_CALENDAR_EVENT,
        conditions: [],
        actions: [{ type: "ENABLE_FOCUS_MODE", order: 0 }],
      },
      {
        name: "Email to Calendar",
        description: "Creates a calendar event automatically when an email contains a meeting invite.",
        roleType: RoleType.CORPORATE_EMPLOYEE,
        isPremium: true,
        triggerType: TriggerType.KEYWORD_DETECTED,
        conditions: [{ field: "KEYWORD", operator: "CONTAINS", value: "schedule a call" }],
        actions: [{ type: "CREATE_CALENDAR_EVENT", order: 0 }],
      },
      {
        name: "Auto-reply while in class",
        description: "Sends a polite auto-reply to non-urgent emails during class hours.",
        roleType: RoleType.STUDENT,
        isPremium: true,
        triggerType: TriggerType.SCHEDULED_TIME,
        conditions: [{ field: "TIME", operator: "EQUALS", value: "09:00-15:00" }],
        actions: [{ type: "AUTO_REPLY", order: 0 }],
      },
      {
        name: "Client email triage",
        description: "Categorizes incoming client emails and logs them for weekly review.",
        roleType: RoleType.FREELANCER,
        isPremium: false,
        triggerType: TriggerType.NEW_EMAIL,
        conditions: [{ field: "CATEGORY", operator: "EQUALS", value: "client" }],
        actions: [
          { type: "CATEGORIZE_EMAIL", order: 0 },
          { type: "SAVE_LOG", order: 1 },
        ],
      },
      {
        name: "Assignment reminder digest",
        description: "Sends a daily summary of upcoming deadlines detected from email keywords.",
        roleType: RoleType.STUDENT,
        isPremium: false,
        triggerType: TriggerType.KEYWORD_DETECTED,
        conditions: [{ field: "KEYWORD", operator: "CONTAINS", value: "due date" }],
        actions: [{ type: "SEND_NOTIFICATION", order: 0 }],
      },
    ],
  });

  console.log("Seed complete. Demo login: demo@autoflow.app / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
