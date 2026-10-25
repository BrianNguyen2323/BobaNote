import { describe, expect, it } from "vitest";
import { bucketCounts, bucketName, periodLabel, periodRange, shiftAnchor, topDrinks } from "./stats";

const d = (date: string, drinkName = "x") => ({ date, drinkName });

describe("periodRange", () => {
  it("starts the week on Sunday", () => {
    // 2026-10-20 is a Tuesday.
    expect(periodRange("week", "2026-10-20")).toEqual({ start: "2026-10-18", end: "2026-10-24" });
    expect(periodRange("week", "2026-10-18")).toEqual({ start: "2026-10-18", end: "2026-10-24" });
    expect(periodRange("week", "2026-10-24")).toEqual({ start: "2026-10-18", end: "2026-10-24" });
  });
  it("spans a week across the year boundary", () => {
    expect(periodRange("week", "2027-01-01")).toEqual({ start: "2026-12-27", end: "2027-01-02" });
  });
  it("knows month lengths including leap February", () => {
    expect(periodRange("month", "2028-02-10").end).toBe("2028-02-29");
    expect(periodRange("month", "2026-02-10").end).toBe("2026-02-28");
    expect(periodRange("month", "2026-04-10")).toEqual({ start: "2026-04-01", end: "2026-04-30" });
    expect(periodRange("month", "2026-10-10").end).toBe("2026-10-31");
  });
  it("covers the whole calendar year", () => {
    expect(periodRange("year", "2026-06-15")).toEqual({ start: "2026-01-01", end: "2026-12-31" });
  });
});

describe("shiftAnchor", () => {
  it("moves weeks by seven days across years", () => {
    expect(shiftAnchor("week", "2026-12-30", 1)).toBe("2027-01-06");
    expect(shiftAnchor("week", "2027-01-02", -1)).toBe("2026-12-26");
  });
  it("clamps the day when a month is shorter", () => {
    expect(shiftAnchor("month", "2026-01-31", 1)).toBe("2026-02-28");
    expect(shiftAnchor("month", "2028-01-31", 1)).toBe("2028-02-29");
    expect(shiftAnchor("month", "2026-03-31", -1)).toBe("2026-02-28");
  });
  it("wraps across years in both directions", () => {
    expect(shiftAnchor("month", "2026-12-15", 1)).toBe("2027-01-15");
    expect(shiftAnchor("month", "2026-01-15", -1)).toBe("2025-12-15");
    expect(shiftAnchor("month", "2026-01-15", -13)).toBe("2024-12-15");
  });
  it("clamps Feb 29 when shifting a year", () => {
    expect(shiftAnchor("year", "2028-02-29", 1)).toBe("2029-02-28");
  });
});

describe("periodLabel", () => {
  it("formats each period", () => {
    expect(periodLabel("week", "2026-10-18", "2026-10-24")).toBe("Oct 18 to 24, 2026");
    expect(periodLabel("week", "2026-10-25", "2026-10-31")).toBe("Oct 25 to 31, 2026");
    expect(periodLabel("month", "2026-10-01", "2026-10-31")).toBe("October 2026");
    expect(periodLabel("year", "2026-01-01", "2026-12-31")).toBe("2026");
  });
  it("handles weeks spanning months and years", () => {
    expect(periodLabel("week", "2026-11-29", "2026-12-05")).toBe("Nov 29 to Dec 5, 2026");
    expect(periodLabel("week", "2026-12-27", "2027-01-02")).toBe("Dec 27, 2026 to Jan 2, 2027");
  });
});

describe("bucketCounts", () => {
  it("returns seven zero-filled days for a week, Sunday first", () => {
    const b = bucketCounts([d("2026-10-20"), d("2026-10-20"), d("2026-10-17"), d("2026-10-25")], "week", "2026-10-21");
    expect(b.map((x) => x.key)).toEqual(["2026-10-18", "2026-10-19", "2026-10-20", "2026-10-21", "2026-10-22", "2026-10-23", "2026-10-24"]);
    expect(b.map((x) => x.count)).toEqual([0, 0, 2, 0, 0, 0, 0]);
    expect(b[0].label).toBe("Sun");
  });
  it("returns one bucket per day of the month", () => {
    expect(bucketCounts([], "month", "2028-02-01")).toHaveLength(29);
    expect(bucketCounts([], "month", "2026-04-01")).toHaveLength(30);
    expect(bucketCounts([], "month", "2026-10-01")).toHaveLength(31);
    const b = bucketCounts([d("2026-10-31"), d("2026-11-01")], "month", "2026-10-05");
    expect(b[30]).toMatchObject({ key: "2026-10-31", label: "31", count: 1 });
  });
  it("returns twelve months for a year and ignores other years", () => {
    const b = bucketCounts([d("2026-01-01"), d("2026-01-31"), d("2026-12-31"), d("2025-12-31"), d("2027-01-01")], "year", "2026-06-01");
    expect(b).toHaveLength(12);
    expect(b[0]).toMatchObject({ key: "2026-01", label: "Jan", count: 2 });
    expect(b[11].count).toBe(1);
    expect(b.reduce((n, x) => n + x.count, 0)).toBe(3);
  });
});

describe("bucketName", () => {
  it("names days and months", () => {
    expect(bucketName("2026-10-20")).toBe("Tue Oct 20");
    expect(bucketName("2026-10")).toBe("Oct 2026");
  });
});

describe("topDrinks", () => {
  it("excludes drinks outside the range and includes both ends", () => {
    const rows = [d("2026-10-17", "a"), d("2026-10-18", "b"), d("2026-10-24", "c"), d("2026-10-25", "d")];
    expect(topDrinks(rows, "2026-10-18", "2026-10-24").map((x) => x.name).sort()).toEqual(["b", "c"]);
  });
  it("groups case and whitespace variants and shows the most recent spelling", () => {
    const rows = [d("2026-10-01", "Brown Sugar  Milk Tea"), d("2026-10-05", " brown sugar milk tea "), d("2026-10-03", "BROWN SUGAR MILK TEA")];
    expect(topDrinks(rows, "2026-10-01", "2026-10-31")).toEqual([{ name: "brown sugar milk tea", count: 3 }]);
  });
  it("ranks by count, then newest drink, then name", () => {
    const rows = [d("2026-10-01", "zeta"), d("2026-10-02", "beta"), d("2026-10-02", "alpha"), d("2026-10-03", "many"), d("2026-10-01", "many")];
    expect(topDrinks(rows, "2026-10-01", "2026-10-31").map((x) => x.name)).toEqual(["many", "alpha", "beta", "zeta"]);
  });
  it("honors the limit", () => {
    const rows = ["a", "b", "c"].map((n) => d("2026-10-01", n));
    expect(topDrinks(rows, "2026-10-01", "2026-10-31", 2)).toHaveLength(2);
  });
});
