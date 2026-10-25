import { expect, test } from "vitest";
import { normalizeDrinkName } from "./drinkName";

test("ignores case and extra whitespace", () => {
  expect(normalizeDrinkName("  Brown  Sugar\tMilk Tea ")).toBe("brown sugar milk tea");
});

test("keeps different drinks apart", () => {
  expect(normalizeDrinkName("Taro Milk Tea")).not.toBe(normalizeDrinkName("Taro Milk"));
});
