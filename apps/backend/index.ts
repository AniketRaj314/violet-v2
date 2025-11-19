import { log, env, Telegram } from "@violet/core";
import { Birthday } from "@violet/birthday";

async function main() {
  log.info("🌸 Initiating Violet");

  //
  // Register TG commands
  //
  Birthday.registerCommands(Telegram.bot);

  //
  // Register cron jobs
  //
  Birthday.registerBirthdayCron();

  await Telegram.sendMessage(env.GROUP_CHAT_ID, "I\'ve been summoned, now online!");
}

main();