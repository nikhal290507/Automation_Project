import { EmailProvider, IntegrationEmail } from "./types";
import { env } from "../utils/env";

// MOCK PROVIDER: Gmail requires Google OAuth consent screen approval before it
// can read a real inbox. Until GMAIL_CLIENT_ID/SECRET are set, AutoFlow runs
// against deterministic sample data so the rest of the product is fully usable.
class MockGmailProvider implements EmailProvider {
  mode = "mock" as const;

  async fetchRecentEmails(accountLabel: string): Promise<IntegrationEmail[]> {
    const now = Date.now();
    return [
      {
        id: "mock-email-1",
        sender: "professor.smith@university.edu",
        subject: "Reminder: Assignment 3 due date",
        snippet: "Please submit your assignment before Friday 11:59pm.",
        receivedAt: new Date(now - 1000 * 60 * 20).toISOString(),
        importance: "high",
      },
      {
        id: "mock-email-2",
        sender: "no-reply@newsletter.dev",
        subject: "This week in engineering",
        snippet: "Your weekly digest of engineering articles is here.",
        receivedAt: new Date(now - 1000 * 60 * 90).toISOString(),
        importance: "low",
      },
      {
        id: "mock-email-3",
        sender: "client@acme.co",
        subject: "Can we schedule a call this week?",
        snippet: "Would love to sync on the proposal, let me know your availability.",
        receivedAt: new Date(now - 1000 * 60 * 180).toISOString(),
        importance: "normal",
      },
    ];
  }

  async sendReply(emailId: string, body: string) {
    console.log(`[mock gmail] auto-reply queued for ${emailId}: "${body.slice(0, 60)}..."`);
    return { delivered: true };
  }
}

class LiveGmailProvider implements EmailProvider {
  mode = "live" as const;
  async fetchRecentEmails(): Promise<IntegrationEmail[]> {
    throw new Error("Live Gmail integration requires completing OAuth setup with GMAIL_CLIENT_ID/SECRET.");
  }
  async sendReply(): Promise<{ delivered: boolean }> {
    throw new Error("Live Gmail integration requires completing OAuth setup with GMAIL_CLIENT_ID/SECRET.");
  }
}

export const gmailProvider: EmailProvider =
  env.nodeEnv && process.env.GMAIL_CLIENT_ID ? new LiveGmailProvider() : new MockGmailProvider();
