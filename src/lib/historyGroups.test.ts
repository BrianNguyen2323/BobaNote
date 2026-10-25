import { describe, expect, it } from "vitest";
import type { DrinkLog } from "./drinks";
import { formatDayHeading, groupByDay } from "./historyGroups";

const drink = (id: string, date: string) => ({ id, date }) as DrinkLog;

describe("groupByDay", () => {
  it("groups adjacent drinks of the same day and keeps order", () => {
    const groups = groupByDay([drink("a", "2026-10-24"), drink("b", "2026-10-24"), drink("c", "2026-10-20")]);
    expect(groups.map((g) => [g.day, g.drinks.map((d) => d.id)])).toEqual([
      ["2026-10-24", ["a", "b"]],
      ["2026-10-20", ["c"]],
    ]);
  });

  it("returns no groups for no drinks", () => {
    expect(groupByDay([])).toEqual([]);
  });
});

describe("formatDayHeading", () => {
  it("formats the ISO day without shifting it", () => {
    expect(formatDayHeading("2026-10-24")).toBe("Sat, Oct 24, 2026");
    expect(formatDayHeading("2026-01-01")).toBe("Thu, Jan 1, 2026");
  });
});
