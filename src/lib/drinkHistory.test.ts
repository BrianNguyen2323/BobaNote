import { describe, expect, it } from "vitest";
import { matchNames, pastDrinkNames, recentShops } from "./drinkHistory";
import type { DrinkLog, Shop } from "./drinks";

const noShop: Shop = { name: "A", address: null, latitude: null, longitude: null, placeId: null };

function drink(drinkName: string, shop: Partial<Shop> = {}): DrinkLog {
  return {
    id: drinkName,
    drinkName,
    date: "2026-10-24",
    size: "M",
    sugarPercent: 50,
    icePercent: 50,
    toppings: [],
    rating: null,
    shop: { ...noShop, ...shop },
    createdAt: "",
  };
}

describe("pastDrinkNames", () => {
  it("keeps the most recent spelling and recency order", () => {
    const names = pastDrinkNames([drink("Taro Tea"), drink("Jasmine"), drink("taro  tea")]);
    expect(names).toEqual(["Taro Tea", "Jasmine"]);
  });
});

describe("recentShops", () => {
  it("groups by place id, else by normalized name, and limits", () => {
    const shops = recentShops([
      drink("a", { name: "Tea Spot", placeId: "p1" }),
      drink("b", { name: "Tea Spot (renamed)", placeId: "p1" }),
      drink("c", { name: "Corner  Shop" }),
      drink("d", { name: "corner shop" }),
      drink("e", { name: "Tea Spot" }),
    ]);
    expect(shops.map((s) => s.name)).toEqual(["Tea Spot", "Corner  Shop", "Tea Spot"]);
    expect(recentShops([drink("a", { name: "X" }), drink("b", { name: "Y" })], 1)).toHaveLength(1);
  });
});

describe("matchNames", () => {
  const names = ["Brown Sugar Milk Tea", "Milk Tea", "Taro Milk Tea", "Jasmine", "Matcha", "Mango", "Mocha", "Milk Foam"];
  it("matches case-insensitively, prefix first, and caps at 5", () => {
    expect(matchNames(names, "  MILK")).toEqual(["Milk Tea", "Milk Foam", "Brown Sugar Milk Tea", "Taro Milk Tea"]);
    expect(matchNames(names, "m")).toHaveLength(5);
  });
  it("returns nothing for empty input or an exact match", () => {
    expect(matchNames(names, "  ")).toEqual([]);
    expect(matchNames(names, "milk tea")).toEqual(["Brown Sugar Milk Tea", "Taro Milk Tea"]);
  });
});
