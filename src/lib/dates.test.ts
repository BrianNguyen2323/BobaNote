import { describe, expect, it } from "vitest";
import { isIsoDay, toIsoDay } from "./dates";

describe("toIsoDay", () => {
  it("uses the local calendar day, not UTC", () => {
    expect(toIsoDay(new Date(2026, 0, 5, 23, 59, 59))).toBe("2026-01-05");
    expect(toIsoDay(new Date(2026, 0, 5, 0, 0, 0))).toBe("2026-01-05");
  });
  it("pads month and day", () => {
    expect(toIsoDay(new Date(2026, 8, 3))).toBe("2026-09-03");
  });
});

describe("isIsoDay", () => {
  it("accepts real days including leap day", () => {
    expect(isIsoDay("2026-10-24")).toBe(true);
    expect(isIsoDay("2028-02-29")).toBe(true);
  });
  it("rejects days that do not exist", () => {
    expect(isIsoDay("2026-02-30")).toBe(false);
    expect(isIsoDay("2027-02-29")).toBe(false);
    expect(isIsoDay("2026-13-01")).toBe(false);
    expect(isIsoDay("2026-00-10")).toBe(false);
    expect(isIsoDay("2026-04-31")).toBe(false);
  });
  it("rejects wrong formats", () => {
    expect(isIsoDay("2026-1-5")).toBe(false);
    expect(isIsoDay("2026-10-24T00:00:00Z")).toBe(false);
    expect(isIsoDay("")).toBe(false);
  });
});
