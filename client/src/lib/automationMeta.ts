import {
  Mail,
  UserRound,
  CalendarPlus,
  Clock,
  Search,
  Tag,
  Star,
  Bell,
  Send,
  CalendarCheck,
  Reply,
  Focus,
  FileText,
  LucideIcon,
} from "lucide-react";
import { ActionType, ConditionField, TriggerType } from "../types";

export const triggerMeta: Record<TriggerType, { label: string; icon: LucideIcon }> = {
  NEW_EMAIL: { label: "New email received", icon: Mail },
  EMAIL_FROM_SENDER: { label: "Email from sender", icon: UserRound },
  NEW_CALENDAR_EVENT: { label: "New calendar event", icon: CalendarPlus },
  SCHEDULED_TIME: { label: "Scheduled time", icon: Clock },
  KEYWORD_DETECTED: { label: "Keyword detected", icon: Search },
};

export const conditionMeta: Record<ConditionField, { label: string; icon: LucideIcon }> = {
  SENDER: { label: "Sender", icon: UserRound },
  SUBJECT: { label: "Subject", icon: FileText },
  KEYWORD: { label: "Keyword", icon: Search },
  TIME: { label: "Time", icon: Clock },
  IMPORTANCE: { label: "Importance", icon: Star },
  CATEGORY: { label: "Category", icon: Tag },
};

export const actionMeta: Record<ActionType, { label: string; icon: LucideIcon }> = {
  CATEGORIZE_EMAIL: { label: "Categorize email", icon: Tag },
  MARK_IMPORTANT: { label: "Mark important", icon: Star },
  SEND_NOTIFICATION: { label: "Send notification", icon: Bell },
  TELEGRAM_NOTIFICATION: { label: "Telegram notification", icon: Send },
  CREATE_CALENDAR_EVENT: { label: "Create calendar event", icon: CalendarCheck },
  AUTO_REPLY: { label: "Auto reply", icon: Reply },
  ENABLE_FOCUS_MODE: { label: "Enable Focus Mode", icon: Focus },
  SAVE_LOG: { label: "Save to log", icon: FileText },
};

export const roleLabels: Record<string, string> = {
  STUDENT: "Student",
  CORPORATE_EMPLOYEE: "Corporate Employee",
  FREELANCER: "Freelancer",
  TEACHER: "Teacher",
  DEVELOPER: "Developer",
  CUSTOM: "Custom",
};

export const providerMeta: Record<string, { label: string }> = {
  GMAIL: { label: "Gmail" },
  GOOGLE_CALENDAR: { label: "Google Calendar" },
  TELEGRAM: { label: "Telegram" },
  OUTLOOK: { label: "Outlook" },
  WHATSAPP: { label: "WhatsApp" },
};
