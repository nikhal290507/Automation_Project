import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const updateMeSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  roleType: z.enum(["STUDENT", "CORPORATE_EMPLOYEE", "FREELANCER", "TEACHER", "DEVELOPER", "CUSTOM"]).optional(),
  onboarded: z.boolean().optional(),
  preferences: z.record(z.unknown()).optional(),
});

const triggerSchema = z.object({
  type: z.enum(["NEW_EMAIL", "EMAIL_FROM_SENDER", "NEW_CALENDAR_EVENT", "SCHEDULED_TIME", "KEYWORD_DETECTED"]),
  config: z.record(z.unknown()).optional(),
});

const conditionSchema = z.object({
  field: z.enum(["SENDER", "SUBJECT", "KEYWORD", "TIME", "IMPORTANCE", "CATEGORY"]),
  operator: z.enum(["EQUALS", "CONTAINS", "NOT_EQUALS", "GREATER_THAN", "LESS_THAN"]).default("EQUALS"),
  value: z.string().min(1),
});

const actionSchema = z.object({
  type: z.enum([
    "CATEGORIZE_EMAIL",
    "MARK_IMPORTANT",
    "SEND_NOTIFICATION",
    "TELEGRAM_NOTIFICATION",
    "CREATE_CALENDAR_EVENT",
    "AUTO_REPLY",
    "ENABLE_FOCUS_MODE",
    "SAVE_LOG",
  ]),
  config: z.record(z.unknown()).optional(),
});

export const createAutomationSchema = z.object({
  name: z.string().min(2, "Give your automation a name").max(120),
  description: z.string().max(300).optional(),
  trigger: triggerSchema,
  conditions: z.array(conditionSchema).default([]),
  actions: z.array(actionSchema).min(1, "Add at least one action"),
});

export const updateAutomationSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  description: z.string().max(300).optional(),
  isEnabled: z.boolean().optional(),
  trigger: triggerSchema.optional(),
  conditions: z.array(conditionSchema).optional(),
  actions: z.array(actionSchema).optional(),
});

export const runAutomationSchema = z.object({
  context: z.record(z.unknown()).default({}),
});

export const connectAppSchema = z.object({
  provider: z.enum(["GMAIL", "GOOGLE_CALENDAR", "TELEGRAM", "OUTLOOK", "WHATSAPP"]),
  accountLabel: z.string().min(1).max(120),
});

export const focusSessionSchema = z.object({
  reason: z.string().max(200).optional(),
});

export const classifyEmailSchema = z.object({
  sender: z.string().min(1),
  subject: z.string().min(1),
  snippet: z.string().max(2000).optional(),
});

export const generateReplySchema = z.object({
  subject: z.string().min(1),
  snippet: z.string().max(2000),
  tone: z.string().max(100).optional(),
});

export const generateAutomationSchema = z.object({
  prompt: z.string().min(5, "Describe the automation in a bit more detail").max(500),
});
