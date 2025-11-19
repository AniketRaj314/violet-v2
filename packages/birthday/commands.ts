import { Telegram, log } from "@violet/core";
import { BirthdayService } from "./service";
import TelegramBot, { Message } from "node-telegram-bot-api";

function escapeHtml(unsafe: string) {
  return unsafe
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function registerCommands(bot: any) {
  bot.onText(/\/newbday (.+)/, async (msg: Message, match: RegExpMatchArray | null) => {
    const chatId = msg.chat.id;
    const replyId = msg.message_id;
    const input = match?.[1]?.trim();

    if (!input) {
      await Telegram.sendMessage(chatId, "Usage: /newbday <Name> <DD-MM-YYYY> [--call] [--tz=Asia/Kolkata] [--note=\"...\"]");
      return;
    }

    try {
      const parsed = parseNewBirthdayArgs(input);

      const result = await BirthdayService.createBirthday(parsed);

      const safeName = escapeHtml(result.name);
      const safeDate = escapeHtml(result.date);

      await Telegram.replyToMessage(
        chatId,
        replyId,
        `🎉 Birthday added for <b>${safeName}</b> on <b>${safeDate}</b>`,
        { parse_mode: "HTML" }
      );
      log.info("Birthday created:", result);

    } catch (err: any) {
      const safeErr = escapeHtml(String(err?.message ?? "Unknown error"));

      await Telegram.replyToMessage(
        chatId,
        replyId,
        `🚨 Error: <code>${safeErr}</code>`,
        { parse_mode: "HTML" }
      );
      log.error("Failed to create birthday:", err);
    }
  });
}

/**
 * Parse input string for /newbday
 * Example: "Spoder 14-05-2001 --call --tz=Asia/Dubai --note=\"college friend\""
 */
function parseNewBirthdayArgs(input: string) {
  // Split respecting quotes for notes
  const parts = input.match(/(?:[^\s"]+|"[^"]*")+/g) || [];

  const name = parts.shift();
  const date = parts.shift();

  if (!name || !date) {
    throw new Error("Invalid format. Expected: <Name> <DD-MM-YYYY>");
  }

  const flags = parts;

  let requires_call = false;
  let timezone = "Asia/Kolkata";
  let notes = "";

  for (const f of flags) {
    if (f === "--call") {
      requires_call = true;
    } else if (f.startsWith("--tz=")) {
      timezone = f.replace("--tz=", "");
    } else if (f.startsWith("--note=")) {
      notes = f.replace("--note=", "").replace(/"/g, "");
    }
  }

  return {
    name,
    date,
    requires_call,
    timezone,
    notes
  };
}
