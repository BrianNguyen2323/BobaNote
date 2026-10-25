import { describe, expect, it } from "vitest";
import type { DrinkLog } from "./drinks";
import { parseHistorySort, sortDrinks } from "./historySort";

const drink = (id: string, date: string, rating: number | null) => ({ id, date, rating }) as DrinkLog;

const newestFirst = [
  drink("a", "2026-10-24", 7),
  drink("b", "2026-10-23", null),
  drink("c", "2026-10-22", 10),
  drink("d", "2026-10-21", 7),
  drink("e", "2026-10-20", 3),
];
const ids = (drinks: DrinkLog[]) => drinks.map((d) => d.id);

describe("sortDrinks", () => {
  it("keeps newest first by default and reverses for oldest", () => {
    expect(ids(sortDrinks(newestFirst, "newest"))).toEqual(["a", "b", "c", "d", "e"]);
    expect(ids(sortDrinks(newestFirst, "oldest"))).toEqual(["e", "d", "c", "b", "a"]);
  });

  it("sorts by rating with unrated last and ties newest first", () => {
    expect(ids(sortDrinks(newestFirst, "rating-high"))).toEqual(["c", "a", "d", "e", "b"]);
    expect(ids(sortDrinks(newestFirst, "rating-low"))).toEqual(["e", "a", "d", "c", "b"]);
  });

  it("does not mutate the input", () => {
    sortDrinks(newestFirst, "oldest");
    sortDrinks(newestFirst, "rating-high");
    expect(ids(newestFirst)).toEqual(["a", "b", "c", "d", "e"]);
  });
});

describe("parseHistorySort", () => {
  it("accepts known values and falls back to newest", () => {
    expect(parseHistorySort("rating-low")).toBe("rating-low");
    expect(parseHistorySort("bogus")).toBe("newest");
    expect(parseHistorySort(undefined)).toBe("newest");
    expect(parseHistorySort(["oldest"])).toBe("newest");
  });
});
