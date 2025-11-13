import dotenv from "dotenv";
dotenv.config();

import { z } from "zod";

const schema = z.object({
  TELEGRAM_TOKEN: z.string().min(1, "TELEGRAM_TOKEN missing"),
  GROUP_CHAT_ID: z.string().min(1, "GROUP_CHAT_ID missing"),
  BIRTHDAY_TOPIC_ID: z.string().min(1, "BIRTHDAY_TOPIC_ID missing"),

  DATABASE_URL: z.string().min(1, "DATABASE_URL missing"),

  LOG_TIMEZONE: z.string().min(1, "LOG_TIMEZONE missing"),

  TWILIO_SID: z.string().optional(),
  TWILIO_AUTH: z.string().optional(),
  TWILIO_FROM: z.string().optional(),
  TWILIO_TO: z.string().optional(),
});

export const env = schema.parse(process.env);
