import { env } from "./env";

function getTimestamp() {
  const date = new Date();

  const formatter = new Intl.DateTimeFormat("en-IN", {
    timeZone: env.LOG_TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });

  const parts = formatter.formatToParts(date);

  const extract = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "";

  const day = extract("day");
  const month = extract("month");
  const year = extract("year");
  const hour = extract("hour");
  const minute = extract("minute");
  const second = extract("second");
  const dayPeriod = extract("dayPeriod").toUpperCase(); // AM / PM

  return `[${day}/${month}/${year} ${hour}:${minute}:${second} ${dayPeriod}]`;
}

function withPrefix(emoji: string) {
  return `${emoji} ${getTimestamp()}`;
}

export const log = {
  info: (...args: any[]) => console.log(withPrefix("💬"), ...args),
  warn: (...args: any[]) => console.warn(withPrefix("⚠️"), ...args),
  error: (...args: any[]) => console.error(withPrefix("🚨"), ...args),
};
