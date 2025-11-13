import TelegramBot from "node-telegram-bot-api";
import { env } from "./env";
import { log } from "./logger";

export const bot = new TelegramBot(env.TELEGRAM_TOKEN, { polling: false });

export async function sendMessage(chatId: number | string, text: string) {
  try {
    return bot.sendMessage(chatId, text, { parse_mode: "HTML" });
  } catch (err) {
    log.error("Telegram sendMessage error:", err);
  }
}

export async function sendToTopic(topicId: number, text: string) {
  try {
    return bot.sendMessage(env.GROUP_CHAT_ID, text, {
      message_thread_id: topicId,
      parse_mode: "HTML"
    });
  } catch (err) {
    log.error("Telegram sendToTopic error:", err);
  }
}

export const Telegram = {
  bot,
  sendMessage,
  sendToTopic
};
