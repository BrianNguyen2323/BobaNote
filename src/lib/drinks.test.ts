import { describe, expect, it } from "vitest";
import { type DrinkInput, type DrinkRow, drinkToRow, parseDrinkInput, rowToDrink } from "./drinks";

const valid = {
  drinkName: "  Brown Sugar Milk Tea ",
  date: "2026-10-24",
  size: " M ",
  sugarPercent: 50,
  icePercent: 120,
  toppings: ["Pudding", " pudding ", "Tapioca pearls"],
  rating: 8,
  shop: { name: " Tea Spot ", address: " 1 Main St ", latitude: 1.5, longitude: -2.5, placeId: "abc" },
};

const errorsOf = (value: unknown) => {
  const r = parseDrinkInput(value);
  return r.ok ? {} : r.errors;
};

describe("parseDrinkInput", () => {
  it("trims strings and de-duplicates toppings case-insensitively, keeping the first", () => {
    const r = parseDrinkInput(valid);
    expect(r.ok && r.value).toEqual({
      ...valid,
      drinkName: "Brown Sugar Milk Tea",
      size: "M",
      toppings: ["Pudding", "Tapioca pearls"],
      shop: { ...valid.shop, name: "Tea Spot", address: "1 Main St" },
    });
  });
  it("allows sugar and ice above 100", () => {
    expect(parseDrinkInput({ ...valid, sugarPercent: 150 }).ok).toBe(true);
  });
  it("requires drinkName, size, and shop.name", () => {
    expect(errorsOf({ ...valid, drinkName: "   " })).toHaveProperty("drinkName");
    expect(errorsOf({ ...valid, size: "" })).toHaveProperty("size");
    expect(errorsOf({ ...valid, shop: { ...valid.shop, name: " " } })).toHaveProperty("shop");
    expect(errorsOf({ ...valid, shop: undefined })).toHaveProperty("shop");
  });
  it("rejects dates that are not real days", () => {
    expect(errorsOf({ ...valid, date: "2026-02-30" })).toHaveProperty("date");
    expect(errorsOf({ ...valid, date: "10/24/2026" })).toHaveProperty("date");
  });
  it("rejects negative, fractional, and non-number sugar and ice", () => {
    for (const bad of [-1, 2.5, "50", NaN, null]) {
      expect(errorsOf({ ...valid, sugarPercent: bad })).toHaveProperty("sugarPercent");
      expect(errorsOf({ ...valid, icePercent: bad })).toHaveProperty("icePercent");
    }
    expect(parseDrinkInput({ ...valid, sugarPercent: 0, icePercent: 0 }).ok).toBe(true);
  });
  it("accepts null rating and 1..10 only", () => {
    expect(parseDrinkInput({ ...valid, rating: null }).ok).toBe(true);
    expect(parseDrinkInput({ ...valid, rating: 1 }).ok).toBe(true);
    expect(parseDrinkInput({ ...valid, rating: 10 }).ok).toBe(true);
    for (const bad of [0, 11, 5.5, "5"]) {
      expect(errorsOf({ ...valid, rating: bad })).toHaveProperty("rating");
    }
  });
  it("rejects empty or non-string toppings", () => {
    expect(errorsOf({ ...valid, toppings: ["a", "  "] })).toHaveProperty("toppings");
    expect(errorsOf({ ...valid, toppings: [3] })).toHaveProperty("toppings");
    expect(errorsOf({ ...valid, toppings: "pudding" })).toHaveProperty("toppings");
  });
  it("requires finite or null shop coordinates", () => {
    expect(errorsOf({ ...valid, shop: { ...valid.shop, latitude: Infinity } })).toHaveProperty("shop");
    expect(errorsOf({ ...valid, shop: { ...valid.shop, longitude: "1" } })).toHaveProperty("shop");
    const r = parseDrinkInput({ ...valid, shop: { name: "X" } });
    expect(r.ok && r.value.shop).toEqual({ name: "X", address: null, latitude: null, longitude: null, placeId: null });
  });
  it("rejects non-objects", () => {
    expect(parseDrinkInput(null).ok).toBe(false);
    expect(parseDrinkInput("x").ok).toBe(false);
  });
});

const row: DrinkRow = {
  id: "id-1",
  drink_name: "Taro",
  date: "2026-10-24",
  size: "L",
  sugar_percent: 25,
  ice_percent: 0,
  toppings: ["Pudding"],
  rating: null,
  shop_name: "Shop",
  shop_address: null,
  shop_latitude: 1,
  shop_longitude: 2,
  shop_place_id: "p",
  created_at: "2026-10-24T10:00:00Z",
};

describe("row mapping", () => {
  it("maps a row to a DrinkLog", () => {
    expect(rowToDrink(row)).toEqual({
      id: "id-1",
      drinkName: "Taro",
      date: "2026-10-24",
      size: "L",
      sugarPercent: 25,
      icePercent: 0,
      toppings: ["Pudding"],
      rating: null,
      shop: { name: "Shop", address: null, latitude: 1, longitude: 2, placeId: "p" },
      createdAt: "2026-10-24T10:00:00Z",
    });
  });
  it("maps an input to columns without id, user_id, or created_at", () => {
    const { id, created_at, ...columns } = row;
    void id;
    void created_at;
    const { createdAt, id: logId, ...input } = rowToDrink(row);
    void createdAt;
    void logId;
    const out = drinkToRow(input as DrinkInput);
    expect(out).toEqual(columns);
    expect(out).not.toHaveProperty("user_id");
  });
});
