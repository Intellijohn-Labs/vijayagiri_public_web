import { SITE, type Branch } from "./data";

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export function fmt12(hhmm: string) {
  const m = toMin(hhmm);
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h % 12 || 12}:${String(mm).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

/** Day of week and minutes since midnight in the dealership's time zone. Call from effects or handlers only. */
export function nowInShopTime(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: SITE.timeZone, weekday: "short", hour: "numeric", minute: "numeric", hourCycle: "h23" }).formatToParts(date);
  const o: Record<string, string> = {};
  for (const p of parts) o[p.type] = p.value;
  return { day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(o.weekday), min: Number(o.hour) * 60 + Number(o.minute) };
}

export function branchStatus(b: Branch, date: Date) {
  const t = nowInShopTime(date);
  const workingToday = !b.days || b.days.includes(t.day);
  const open = workingToday && t.min >= toMin(b.open) && t.min < toMin(b.close);
  return { open, detail: open ? `Closes ${fmt12(b.close)}` : `Opens ${fmt12(b.open)}` };
}
