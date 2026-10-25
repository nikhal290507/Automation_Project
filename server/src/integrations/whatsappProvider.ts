import { MessagingProvider } from "./types";

// MOCK PROVIDER: WhatsApp requires Meta Business API approval (WHATSAPP_API_TOKEN).
class MockWhatsAppProvider implements MessagingProvider {
  mode = "mock" as const;
  async sendMessage(accountLabel: string, message: string) {
    console.log(`[mock whatsapp -> ${accountLabel}] ${message}`);
    return { delivered: true };
  }
}

export const whatsappProvider: MessagingProvider = new MockWhatsAppProvider();
