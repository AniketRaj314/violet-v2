import { log, env, Telegram } from "@violet/core";

async function main() {
  log.info("🌸 Violet backend starting...");

  await Telegram.sendMessage(env.GROUP_CHAT_ID, "Violet backend connected");
}

main();
