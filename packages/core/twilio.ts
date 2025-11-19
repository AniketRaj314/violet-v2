import twilio from "twilio";
import { log } from "./logger";
import { env } from "./env";

const client = twilio(env.TWILIO_SID, env.TWILIO_AUTH);

export const Call = {
  async makeCall(to: string = env.TWILIO_TO ?? "", message: string = "Hello, this is a test call from Violet") {
    if (!to) {
      throw new Error("No destination number provided for call.");
    }
    if (!env.TWILIO_FROM) {
      throw new Error("No source number provided for call.");
    }
    try {
      const twiml = `<Response><Say>${message}</Say></Response>`;

      const res = await client.calls.create({
        twiml,
        to,
        from: env.TWILIO_FROM ?? ""
      });

      log.info("Call placed:", res.sid);

      return res.sid;
    } catch (err) {
      log.error("Call failed:", err);
      throw err;
    }
  }
};
