import { query } from "@violet/core";
import { log } from "@violet/core";

export const BirthdayService = {
  async createBirthday(input: {
    name: string;
    date: string; // DD-MM-YYYY
    requires_call: boolean;
    timezone: string;
    notes: string;
  }) {
    // Validate name
    const name = input.name.trim();
    if (name.length === 0) {
      throw new Error("Name cannot be empty.");
    }

    // Validate and convert date
    const birthday_date = parseDate(input.date); // returns YYYY-MM-DD
    if (!birthday_date) {
      throw new Error("Invalid date format. Expected DD-MM-YYYY.");
    }

    // Insert into DB
    const sql = `
      INSERT INTO birthdays (
        name,
        birthday_date,
        requires_call,
        timezone,
        notes
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, birthday_date;
    `;

    const params = [
      name,
      birthday_date,
      input.requires_call,
      input.timezone,
      input.notes
    ];

    const res = await query(sql, params);
    const created = res.rows[0];

    log.info("Birthday stored in DB:", created);

    return {
      id: created.id,
      name: created.name,
      date: formatDateDisplay(created.birthday_date) // back to DD-MM-YYYY
    };
  },

  async getTodaysBirthdays(timezone: string = "Asia/Kolkata") {
    const today = new Date().toLocaleDateString("en-GB", {
      timeZone: timezone
    });

    // today → "DD/MM/YYYY"
    const [day, month] = today.split("/");

    const sql = `
      SELECT *
      FROM birthdays
      WHERE EXTRACT(DAY FROM birthday_date) = $1
      AND EXTRACT(MONTH FROM birthday_date) = $2
    `;

    const res = await query(sql, [day, month]);
    return res.rows;
  },

  async markTelegramSent(id: string) {
    await query(`UPDATE birthdays SET telegram_sent = true WHERE id = $1`, [id]);
  },

  async resetDailyFlags() {
    await query(`
      UPDATE birthdays
      SET telegram_sent = false, call_completed = false
      WHERE telegram_sent = true OR call_completed = true
    `);
  },

  async markCallCompleted(id: string) {
    await query(`UPDATE birthdays SET call_completed = true WHERE id = $1`, [id]);
  }

};

/**
 * Convert "DD-MM-YYYY" → "YYYY-MM-DD"
 */
function parseDate(input: string): string | null {
  const parts = input.split("-");
  if (parts.length !== 3) return null;

  const [dd, mm, yyyy] = parts;

  if (
    dd.length !== 2 ||
    mm.length !== 2 ||
    yyyy.length !== 4 ||
    isNaN(Number(dd)) ||
    isNaN(Number(mm)) ||
    isNaN(Number(yyyy))
  ) {
    return null;
  }

  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Convert DB date "YYYY-MM-DD" → "DD-MM-YYYY"
 */
function formatDateDisplay(dbDate: string | Date): string {
  let date = dbDate instanceof Date ? dbDate : new Date(dbDate);

  const yyyy = date.getFullYear();               // local year
  const mm = String(date.getMonth() + 1).padStart(2, "0"); // local month
  const dd = String(date.getDate()).padStart(2, "0");       // local day

  return `${dd}/${mm}/${yyyy}`;
}


