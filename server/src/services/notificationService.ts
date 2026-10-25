import { prisma } from "../utils/prisma";
import { telegramProvider } from "../integrations";

interface SendNotificationInput {
  userId: string;
  title: string;
  message: string;
  channel?: "IN_APP" | "TELEGRAM" | "EMAIL";
  telegramLabel?: string;
}

// Single place responsible for fanning a notification out to the right channel
// and persisting it so the Activity/Notifications UI has a durable record.
export async function sendNotification(input: SendNotificationInput) {
  const channel = input.channel ?? "IN_APP";

  if (channel === "TELEGRAM") {
    await telegramProvider.sendMessage(input.telegramLabel ?? "unknown", input.message);
  }

  return prisma.notification.create({
    data: {
      userId: input.userId,
      channel,
      title: input.title,
      message: input.message,
    },
  });
}
