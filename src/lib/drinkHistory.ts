import { normalizeDrinkName } from "./drinkName";
import type { DrinkLog, Shop } from "./drinks";

// All three helpers expect `drinks` newest first, the order listDrinks returns.

function firstPerKey<T>(items: T[], keyOf: (item: T) => string): T[] {
  const seen = new Map<string, T>();
  for (const item of items) {
    const key = keyOf(item);
    if (!seen.has(key)) seen.set(key, item);
  }
  return [...seen.values()];
}

/** Distinct drink names, using the most recent spelling of each, most recent first. */
export function pastDrinkNames(drinks: DrinkLog[]): string[] {
  return firstPerKey(drinks, (d) => normalizeDrinkName(d.drinkName)).map((d) => d.drinkName);
}

/** Distinct shops (by Google place id, else by normalized name), most recent first. */
export function recentShops(drinks: DrinkLog[], limit = 5): Shop[] {
  const key = ({ shop }: DrinkLog) => shop.placeId ?? `name:${normalizeDrinkName(shop.name)}`;
  return firstPerKey(drinks, key)
    .slice(0, limit)
    .map((d) => d.shop);
}

/** Case-insensitive matches for what the user typed. Prefix matches come first. Hides an exact match. */
export function matchNames(names: string[], typed: string, limit = 5): string[] {
  const needle = normalizeDrinkName(typed);
  if (!needle) return [];
  const hits = names.filter((n) => {
    const hay = normalizeDrinkName(n);
    return hay !== needle && hay.includes(needle);
  });
  const starts = (n: string) => normalizeDrinkName(n).startsWith(needle);
  return [...hits.filter(starts), ...hits.filter((n) => !starts(n))].slice(0, limit);
}
