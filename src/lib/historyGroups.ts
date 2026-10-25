import type { DrinkLog } from "./drinks";

export type DayGroup = { day: string; drinks: DrinkLog[] };

/** Groups adjacent drinks of the same day, keeping the input order (newest or oldest first). */
export function groupByDay(drinks: DrinkLog[]): DayGroup[] {
  const groups: DayGroup[] = [];
  for (const drink of drinks) {
    const last = groups[groups.length - 1];
    if (last && last.day === drink.date) {
      last.drinks.push(drink);
    } else {
      groups.push({ day: drink.date, drinks: [drink] });
    }
  }
  return groups;
}

/** "Sat, Oct 24, 2026". Built from the ISO day in UTC so no time zone can shift it. */
export function formatDayHeading(day: string): string {
  const [y, m, d] = day.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}
