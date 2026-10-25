export type Role = 'student' | 'professional';

export type Theme = 'light' | 'dark';

export interface User {
  name: string;
  email: string;
  role: Role;
  avatarColor: string;
  loggedIn: boolean;
}

export type EmailCategory =
  | 'Important'
  | 'Work'
  | 'College'
  | 'Meetings'
  | 'Promotions'
  | 'Spam'
  | 'Other';

export interface Email {
  id: string;
  sender: string;
  senderEmail: string;
  subject: string;
  preview: string;
  body: string;
  category: EmailCategory;
  important: boolean;
  spam: boolean;
  archived: boolean;
  read: boolean;
  timestamp: string; // ISO
}

export type EventCategory = 'Meeting' | 'Class' | 'Personal' | 'Deadline' | 'Other';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  category: EventCategory;
  notes?: string;
}

export type ConditionType = 'senderContains' | 'subjectContains' | 'category' | 'keywordContains';
export type ActionType = 'markImportant' | 'moveToCategory' | 'markSpam' | 'archive' | 'createTask';

export interface AutomationCondition {
  type: ConditionType;
  value: string; // for category, one of EmailCategory
}

export interface AutomationAction {
  type: ActionType;
  value?: string; // category name for moveToCategory, task title for createTask
}

export interface Automation {
  id: string;
  name: string;
  condition: AutomationCondition;
  action: AutomationAction;
  enabled: boolean;
  createdAt: string;
  timesTriggered: number;
}

export interface Task {
  id: string;
  title: string;
  priority: 'Low' | 'Medium' | 'High';
  dueDate: string; // YYYY-MM-DD
  completed: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  message: string;
  timestamp: string; // ISO
  type: 'automation' | 'focus' | 'calendar' | 'task' | 'connection' | 'system';
}

export type AppId = 'gmail' | 'gcal' | 'telegram' | 'whatsapp';

export interface AppConnection {
  id: AppId;
  name: string;
  connected: boolean;
  connectedAt?: string;
}

export interface FocusSession {
  id: string;
  title: string;
  startTime: string; // ISO
  endTime: string; // ISO
  linkedEventId?: string;
  active: boolean;
  createdAt: string;
}

export interface NotificationPrefs {
  emailAlerts: boolean;
  meetingReminders: boolean;
  automationAlerts: boolean;
  focusModeMutes: boolean;
}
