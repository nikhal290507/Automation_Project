import { EmailProvider, IntegrationEmail } from "./types";

// MOCK PROVIDER: Outlook requires Microsoft Identity Platform app registration
// and admin consent (OUTLOOK_CLIENT_ID/SECRET). Mocked for local development.
class MockOutlookProvider implements EmailProvider {
  mode = "mock" as const;
  async fetchRecentEmails(): Promise<IntegrationEmail[]> {
    return [];
  }
  async sendReply(emailId: string, body: string) {
    console.log(`[mock outlook] auto-reply queued for ${emailId}: "${body.slice(0, 60)}..."`);
    return { delivered: true };
  }
}

export const outlookProvider: EmailProvider = new MockOutlookProvider();
