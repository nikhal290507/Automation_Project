export type RoleType = "STUDENT" | "CORPORATE_EMPLOYEE" | "FREELANCER" | "TEACHER" | "DEVELOPER" | "CUSTOM";
export type AppProvider = "GMAIL" | "GOOGLE_CALENDAR" | "TELEGRAM" | "OUTLOOK" | "WHATSAPP";
export type ConnectionStatus = "CONNECTED" | "DISCONNECTED" | "MOCK" | "ERROR";
export type TriggerType = "NEW_EMAIL" | "EMAIL_FROM_SENDER" | "NEW_CALENDAR_EVENT" | "SCHEDULED_TIME" | "KEYWORD_DETECTED";
export type ConditionField = "SENDER" | "SUBJECT" | "KEYWORD" | "TIME" | "IMPORTANCE" | "CATEGORY";
export type ConditionOperator = "EQUALS" | "CONTAINS" | "NOT_EQUALS" | "GREATER_THAN" | "LESS_THAN";
export type ActionType =
  | "CATEGORIZE_EMAIL"
  | "MARK_IMPORTANT"
  | "SEND_NOTIFICATION"
  | "TELEGRAM_NOTIFICATION"
  | "CREATE_CALENDAR_EVENT"
  | "AUTO_REPLY"
  | "ENABLE_FOCUS_MODE"
  | "SAVE_LOG";
export type ExecutionStatus = "SUCCESS" | "FAILED" | "PARTIAL" | "SKIPPED";
export type SubscriptionPlan = "FREE" | "PREMIUM";

export interface User {
  id: string;
  email: string;
  name: string;
  roleType: RoleType;
  onboarded: boolean;
  avatarUrl: string | null;
  preferences?: Record<string, unknown>;
}

export interface ConnectedApp {
  id: string;
  provider: AppProvider;
  status: ConnectionStatus;
  accountLabel: string | null;
  connectedAt: string;
}

export interface AutomationTrigger {
  id: string;
  type: TriggerType;
  config: Record<string, unknown> | null;
}
export interface AutomationCondition {
  id: string;
  field: ConditionField;
  operator: ConditionOperator;
  value: string;
}
export interface AutomationAction {
  id: string;
  type: ActionType;
  order: number;
  config: Record<string, unknown> | null;
}

export interface Automation {
  id: string;
  name: string;
  description: string | null;
  isEnabled: boolean;
  lastExecuted: string | null;
  createdAt: string;
  triggers: AutomationTrigger[];
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  executions?: AutomationExecution[];
}

export interface AutomationExecution {
  id: string;
  status: ExecutionStatus;
  resultSummary: string | null;
  durationMs: number | null;
  createdAt: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  roleType: RoleType;
  isPremium: boolean;
  triggerType: TriggerType;
  conditions: Array<{ field: ConditionField; operator: ConditionOperator; value: string }>;
  actions: Array<{ type: ActionType; config?: Record<string, unknown> }>;
}

export interface ActivityLogEntry {
  id: string;
  type: string;
  message: string;
  createdAt: string;
}

export interface FocusSession {
  id: string;
  isActive: boolean;
  reason: string | null;
  startedAt: string;
  endedAt: string | null;
}

export interface Subscription {
  id: string;
  plan: SubscriptionPlan;
  status: string;
  currentPeriodEnd: string | null;
}

export interface DashboardData {
  greetingName: string;
  productivityScore: number;
  importantEmails: Array<{ id: string; sender: string; subject: string; snippet: string; receivedAt: string; importance: string }>;
  meetingsToday: Array<{ id: string; title: string; startsAt: string; endsAt: string; attendees: string[] }>;
  activeAutomations: Automation[];
  automations: Automation[];
  focusSession: FocusSession | null;
  recentActivity: ActivityLogEntry[];
  connectedApps: ConnectedApp[];
  dailySummary: { emailsProcessed: number; automationsRun: number; successRate: number };
}
