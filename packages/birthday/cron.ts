import cron from "node-cron";
import { log, Telegram, env } from "@violet/core";
import { BirthdayService, formatBirthdayNotificationMessage } from "./service";
import { Call } from "@violet/core";

export function registerBirthdayCron() {
  // 1. Reset flags daily at midnight
  cron.schedule("0 0 * * *", async () => {
    try {
      log.info("Running daily birthday reset...");
      await BirthdayService.resetDailyFlags();
      log.info("Birthday flags reset.");
    } catch (err) {
      log.error("Daily birthday reset failed:", err);
    }
  });

  // 2. Birthday reminders at 00:15
  cron.schedule("15 0 * * *", async () => {
    try {
      log.info("Checking today's birthdays...");

      const birthdays = await BirthdayService.getTodaysBirthdays(env.LOG_TIMEZONE);

      if (birthdays.length === 0) {
        log.info("No birthdays today.");
        return;
      }

      for (const bday of birthdays) {
        // Prevent duplicate sends
        if (bday.telegram_sent) {
          log.info(`Already sent for ${bday.name}, skipping.`);
          continue;
        }

        // Build the birthday message
        const message = formatBirthdayNotificationMessage(bday);

        // Send Telegram announcement into the priority topic
        await Telegram.sendToTopic(
          Number(env.PRIORITY_TOPIC_ID),
          message,
          { parse_mode: "HTML" }
        );

        await BirthdayService.markTelegramSent(bday.id);
        log.info(`Sent birthday announcement for ${bday.name}.`);

        // If a call is required, execute it
        if (bday.requires_call && !bday.call_completed) {
          try {
            const callMessage = `Reminder. Today is ${bday.name}'s birthday.`;
            await Call.makeCall(env.TWILIO_TO, callMessage);
            await BirthdayService.markCallCompleted(bday.id);
            log.info(`Call made for ${bday.name}.`);
          } catch (err) {
            log.error(`Failed to call for ${bday.name}:`, err);
          }
        }
      }
    } catch (err) {
      log.error("Birthday cron failed:", err);
    }
  });
}
