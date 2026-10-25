import { gmailProvider, outlookProvider, IntegrationEmail } from "../integrations";

// Thin façade over provider-specific email integrations so the automation
// engine and controllers never import a specific provider directly.
export async function fetchRecentEmails(provider: "GMAIL" | "OUTLOOK", accountLabel: string): Promise<IntegrationEmail[]> {
  if (provider === "GMAIL") return gmailProvider.fetchRecentEmails(accountLabel);
  return outlookProvider.fetchRecentEmails(accountLabel);
}

export async function sendAutoReply(provider: "GMAIL" | "OUTLOOK", emailId: string, body: string) {
  if (provider === "GMAIL") return gmailProvider.sendReply(emailId, body);
  return outlookProvider.sendReply(emailId, body);
}
