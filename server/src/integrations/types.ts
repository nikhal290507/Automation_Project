// Shared contract every integration provider implements, whether it's a real
// OAuth-backed provider or a local mock. The automation engine only ever talks
// to this interface, so swapping a mock for a real provider later requires no
// changes to triggerService / actionService / automationService.

export type IntegrationMode = "mock" | "live";

export interface IntegrationEmail {
  id: string;
  sender: string;
  subject: string;
  snippet: string;
  receivedAt: string;
  importance: "high" | "normal" | "low";
}

export interface IntegrationCalendarEvent {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  attendees: string[];
}

export interface EmailProvider {
  mode: IntegrationMode;
  fetchRecentEmails(accountLabel: string): Promise<IntegrationEmail[]>;
  sendReply(emailId: string, body: string): Promise<{ delivered: boolean }>;
}

export interface CalendarProvider {
  mode: IntegrationMode;
  fetchUpcomingEvents(accountLabel: string): Promise<IntegrationCalendarEvent[]>;
  createEvent(input: { title: string; startsAt: string; endsAt: string }): Promise<IntegrationCalendarEvent>;
}

export interface MessagingProvider {
  mode: IntegrationMode;
  sendMessage(accountLabel: string, message: string): Promise<{ delivered: boolean }>;
}
