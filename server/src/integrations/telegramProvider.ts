import { MessagingProvider } from "./types";
import { env } from "../utils/env";

// MOCK PROVIDER: sending real Telegram messages requires a bot token from
// @BotFather (TELEGRAM_BOT_TOKEN). Without it, messages are logged instead of sent.
class MockTelegramProvider implements MessagingProvider {
  mode = "mock" as const;
  async sendMessage(accountLabel: string, message: string) {
    console.log(`[mock telegram -> ${accountLabel}] ${message}`);
    return { delivered: true };
  }
}

export const telegramProvider: MessagingProvider = new MockTelegramProvider();
export const isTelegramLive = Boolean(process.env.TELEGRAM_BOT_TOKEN);
void env; // reserved for when live mode is implemented
