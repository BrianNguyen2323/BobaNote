import type { DrinkLog } from "./drinks";

export const HISTORY_SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "rating-high", label: "Highest rated" },
  { value: "rating-low", label: "Lowest rated" },
] as const;

export type HistorySort = (typeof HISTORY_SORTS)[number]["value"];

export const DEFAULT_HISTORY_SORT: HistorySort = "newest";

/** Reads `?sort=` from the URL. Anything unknown falls back to newest first. */
export function parseHistorySort(raw: unknown): HistorySort {
  return HISTORY_SORTS.find((s) => s.value === raw)?.value ?? DEFAULT_HISTORY_SORT;
}

export function isRatingSort(sort: HistorySort): boolean {
  return sort === "rating-high" || sort === "rating-low";
}

/**
 * Expects newest first, as `listDrinks()` returns. Rating sorts keep unrated drinks last
 * and break ties newest first, relying on `Array.prototype.sort` being stable.
 */
export function sortDrinks(drinks: DrinkLog[], sort: HistorySort): DrinkLog[] {
  switch (sort) {
    case "newest":
      return drinks;
    case "oldest":
      return [...drinks].reverse();
    case "rating-high":
    case "rating-low": {
      const sign = sort === "rating-high" ? -1 : 1;
      return [...drinks].sort((a, b) => {
        if (a.rating === b.rating) return 0;
        if (a.rating === null) return 1;
        if (b.rating === null) return -1;
        return sign * (a.rating - b.rating);
      });
    }
  }
}
