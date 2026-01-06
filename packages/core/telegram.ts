import TelegramBot, { SendMessageOptions } from "node-telegram-bot-api";
import { env } from "./env";
import { log } from "./logger";

export const bot = new TelegramBot(env.TELEGRAM_TOKEN, { polling: true });

/**
 * Generic sendMessage wrapper that accepts optional SendMessageOptions.
 */
export async function sendMessage(
  chatId: number | string,
  text: string,
  options?: SendMessageOptions
) {
  try {
    return bot.sendMessage(chatId, text, options);
  } catch (err) {
    log.error("Telegram sendMessage error:", err);
    throw err;
  }
}

/**
 * Convenience helper to send directly into a forum topic.
 * If topicId is undefined/null, will send to the root chat.
 */
export async function sendToTopic(
  topicId: number | null | undefined,
  text: string,
  options?: SendMessageOptions
) {
  try {
    const opts: SendMessageOptions = {
      ...(options || {}),
      ...(topicId ? { message_thread_id: topicId } : {})
    };
    return sendMessage(env.GROUP_CHAT_ID, text, opts);
  } catch (err) {
    log.error("Telegram sendToTopic error:", err);
    throw err;
  }
}

export async function replyToMessage(chatId: number | string, replyToMessageId: number, text: string, options?: SendMessageOptions) {
  return sendMessage(chatId, text, { ...(options || {}), reply_to_message_id: replyToMessageId });
}

/**
 * Delete a message from a chat
 */
export async function deleteMessage(chatId: number | string, messageId: number) {
  try {
    return bot.deleteMessage(chatId, messageId);
  } catch (err) {
    log.error("Telegram deleteMessage error:", err);
    throw err;
  }
}

export const Telegram = {
  bot,
  sendMessage,
  sendToTopic,
  replyToMessage,
  deleteMessage
};
