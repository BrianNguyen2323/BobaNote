import type { DrinkLog } from "./drinks";
import { normalizeDrinkName } from "./drinkName";

export type Period = "week" | "month" | "year";

// 0 = Sunday, matching US calendars. Change here only.
export const WEEK_STARTS_ON = 0;

const DAY_MS = 86_400_000;

// All math runs on UTC dates built from the parsed parts, so local time zones and DST cannot move a day.
function parse(day: string): Date {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function iso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(day: string, n: number): string {
  return iso(new Date(parse(day).getTime() + n * DAY_MS));
}

function daysInMonth(year: number, month0: number): number {
  return new Date(Date.UTC(year, month0 + 1, 0)).getUTCDate();
}

const fmt = (day: string, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-US", { ...options, timeZone: "UTC" }).format(parse(day));

/** Inclusive first and last ISO day of the calendar week, month, or year containing `anchorDay`. */
export function periodRange(period: Period, anchorDay: string): { start: string; end: string } {
  const d = parse(anchorDay);
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth();
  if (period === "week") {
    const start = addDays(anchorDay, -((d.getUTCDay() - WEEK_STARTS_ON + 7) % 7));
    return { start, end: addDays(start, 6) };
  }
  if (period === "month") {
    return { start: iso(new Date(Date.UTC(y, m, 1))), end: iso(new Date(Date.UTC(y, m, daysInMonth(y, m)))) };
  }
  return { start: iso(new Date(Date.UTC(y, 0, 1))), end: iso(new Date(Date.UTC(y, 11, 31))) };
}

/** Moves the anchor by whole periods. Month and year shifts clamp the day (Jan 31 + 1 month = Feb 28 or 29). */
export function shiftAnchor(period: Period, anchorDay: string, delta: number): string {
  if (period === "week") {
    return addDays(anchorDay, 7 * delta);
  }
  const d = parse(anchorDay);
  const target = d.getUTCFullYear() * 12 + d.getUTCMonth() + (period === "month" ? delta : 12 * delta);
  const y = Math.floor(target / 12);
  const m = target - y * 12;
  return iso(new Date(Date.UTC(y, m, Math.min(d.getUTCDate(), daysInMonth(y, m)))));
}

/** "Oct 18 to 24, 2026", "Oct 28 to Nov 3, 2026", "Dec 27, 2026 to Jan 2, 2027", "October 2026", "2026". */
export function periodLabel(period: Period, start: string, end: string): string {
  if (period === "year") {
    return start.slice(0, 4);
  }
  if (period === "month") {
    return fmt(start, { month: "long", year: "numeric" });
  }
  const full: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
  if (start.slice(0, 4) !== end.slice(0, 4)) {
    return `${fmt(start, full)} to ${fmt(end, full)}`;
  }
  const endPart = start.slice(5, 7) === end.slice(5, 7) ? fmt(end, { day: "numeric" }) : fmt(end, { month: "short", day: "numeric" });
  return `${fmt(start, { month: "short", day: "numeric" })} to ${endPart}, ${start.slice(0, 4)}`;
}

/** Full name of a bucket for screen readers: "Tue Oct 20" for a day key, "Oct 2026" for a YYYY-MM key. */
export function bucketName(key: string): string {
  return key.length === 7
    ? fmt(`${key}-01`, { month: "short", year: "numeric" })
    : fmt(key, { weekday: "short", month: "short", day: "numeric" }).replace(",", "");
}

/** Zero-filled counts: one bucket per day (week, month) or per month (year). Keys are ISO days or YYYY-MM. */
export function bucketCounts(
  drinks: Pick<DrinkLog, "date">[],
  period: Period,
  anchorDay: string,
): { key: string; label: string; count: number }[] {
  const { start, end } = periodRange(period, anchorDay);
  const perMonth = period === "year";
  const keys = perMonth
    ? Array.from({ length: 12 }, (_, i) => `${start.slice(0, 4)}-${String(i + 1).padStart(2, "0")}`)
    : Array.from({ length: period === "week" ? 7 : Number(end.slice(8)) }, (_, i) => addDays(start, i));
  const counts = new Map(keys.map((key) => [key, 0]));
  for (const { date } of drinks) {
    const key = perMonth ? date.slice(0, 7) : date;
    if (counts.has(key)) {
      counts.set(key, counts.get(key)! + 1);
    }
  }
  return keys.map((key) => ({
    key,
    label: perMonth ? fmt(`${key}-01`, { month: "short" }) : period === "week" ? fmt(key, { weekday: "short" }) : String(Number(key.slice(8))),
    count: counts.get(key)!,
  }));
}

type DrinkSample = Pick<DrinkLog, "date" | "drinkName" | "rating">;
type NameGroup = { name: string; latest: string; count: number; ratingSum: number; ratedCount: number };

const cmp = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

/** Drinks in [start, end] grouped by normalized name, showing the most recent spelling. */
function groupByName(drinks: DrinkSample[], start: string, end: string): NameGroup[] {
  const groups = new Map<string, NameGroup>();
  for (const { date, drinkName, rating } of drinks) {
    if (date < start || date > end) {
      continue;
    }
    const key = normalizeDrinkName(drinkName);
    let group = groups.get(key);
    if (!group) {
      group = { name: drinkName.trim(), latest: date, count: 0, ratingSum: 0, ratedCount: 0 };
      groups.set(key, group);
    } else if (date > group.latest) {
      group.latest = date;
      group.name = drinkName.trim();
    }
    group.count += 1;
    if (rating !== null) {
      group.ratingSum += rating;
      group.ratedCount += 1;
    }
  }
  return [...groups.values()];
}

/** Most ordered drinks in [start, end]. Ties: newest drink, then name. */
export function topDrinks(drinks: DrinkSample[], start: string, end: string, limit = 5): { name: string; count: number }[] {
  return groupByName(drinks, start, end)
    .sort((a, b) => b.count - a.count || cmp(b.latest, a.latest) || cmp(a.name, b.name))
    .slice(0, limit)
    .map(({ name, count }) => ({ name, count }));
}

export type RatedDrink = { name: string; averageRating: number; ratedCount: number; count: number };

/**
 * Highest average rating in [start, end]. Skipped ratings don't count toward the average,
 * so `ratedCount` can be lower than `count`. Ties: more ratings, then newest drink, then name.
 */
export function topRatedDrinks(drinks: DrinkSample[], start: string, end: string, limit = 3): RatedDrink[] {
  return groupByName(drinks, start, end)
    .filter((g) => g.ratedCount > 0)
    .map((g) => ({ ...g, averageRating: g.ratingSum / g.ratedCount }))
    .sort((a, b) => b.averageRating - a.averageRating || b.ratedCount - a.ratedCount || cmp(b.latest, a.latest) || cmp(a.name, b.name))
    .slice(0, limit)
    .map(({ name, averageRating, ratedCount, count }) => ({ name, averageRating, ratedCount, count }));
}
