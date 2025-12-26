import { Telegram, log } from "@violet/core";
import { BirthdayService, formatDateDisplay } from "./service";
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
      await Telegram.sendMessage(chatId, "Usage: /newbday <Name> <DD-MM-YYYY> [--call] [--tz=Asia/Kolkata] [--notes=\"...\"]");
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

  bot.onText(/\/listbday/, async (msg: Message) => {
    const chatId = msg.chat.id;
    const replyId = msg.message_id;

    try {
      const birthdays = await BirthdayService.getAllBirthdays();

      if (birthdays.length === 0) {
        await Telegram.replyToMessage(
          chatId,
          replyId,
          "📅 No birthdays found in the database.",
          { parse_mode: "HTML" }
        );
        return;
      }

      // Format as a table
      const table = formatBirthdaysTable(birthdays);

      await Telegram.replyToMessage(
        chatId,
        replyId,
        table,
        { parse_mode: "HTML" }
      );
      log.info(`Listed ${birthdays.length} birthdays`);

    } catch (err: any) {
      const safeErr = escapeHtml(String(err?.message ?? "Unknown error"));

      await Telegram.replyToMessage(
        chatId,
        replyId,
        `🚨 Error: <code>${safeErr}</code>`,
        { parse_mode: "HTML" }
      );
      log.error("Failed to list birthdays:", err);
    }
  });
}

/**
 * Parse input string for /newbday
 * Example: "Spoder 14-05-2001 --call --tz=Asia/Dubai --notes=\"college friend\""
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
    } else if (f.startsWith("--notes=")) {
      notes = f.replace("--notes=", "").replace(/"/g, "");
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

/**
 * Format date as DD/MM (without year)
 */
function formatDateShort(dbDate: string | Date): string {
  let date = dbDate instanceof Date ? dbDate : new Date(dbDate);

  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  return `${dd}/${mm}`;
}

/**
 * Format birthdays as a readable table
 */
function formatBirthdaysTable(birthdays: any[]): string {
  // Calculate column widths
  const maxNameWidth = Math.max(
    "Name".length,
    ...birthdays.map(b => b.name.length)
  );
  const maxDateWidth = 5; // DD/MM
  const maxNotesWidth = Math.max(
    "Notes".length,
    ...birthdays.map(b => Math.min((b.notes || "").length, 40))
  );

  // Build header
  const header = [
    "Name".padEnd(maxNameWidth),
    "Date".padEnd(maxDateWidth),
    "Call".padEnd(5),
    "Notes".padEnd(maxNotesWidth)
  ].join(" │ ");

  // Build separator
  const separator = "─".repeat(header.length);

  // Build rows
  const rows = birthdays.map(b => {
    const name = escapeHtml(b.name).padEnd(maxNameWidth);
    const date = formatDateShort(b.birthday_date).padEnd(maxDateWidth);
    const call = b.requires_call ? "✓" : "✗";
    const notes = escapeHtml(b.notes || "").substring(0, 40).padEnd(maxNotesWidth);

    return [name, date, call.padEnd(5), notes].join(" │ ");
  });

  // Combine everything
  const table = [
    "<pre>",
    "🎉 All Birthdays",
    separator,
    header,
    separator,
    ...rows,
    separator,
    `Total: ${birthdays.length} birthday${birthdays.length !== 1 ? "s" : ""}`,
    "</pre>"
  ].join("\n");

  return table;
}
