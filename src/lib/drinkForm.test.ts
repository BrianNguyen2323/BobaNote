import { describe, expect, it } from "vitest";
import { emptyForm, fromDrink, toActionInput } from "./drinkForm";
import { parseDrinkInput } from "./drinks";

describe("drink form mapping", () => {
  it("rejects an empty form with field errors, not zeros", () => {
    const result = parseDrinkInput(toActionInput(emptyForm));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(Object.keys(result.errors).sort()).toEqual(["date", "drinkName", "icePercent", "shop", "size", "sugarPercent"]);
    }
  });

  it("round-trips a drink, including a custom 120% sugar", () => {
    const input = {
      drinkName: "Taro Tea",
      date: "2026-10-24",
      size: "XL",
      sugarPercent: 120,
      icePercent: 0,
      toppings: ["Pudding"],
      rating: 8,
      shop: { name: "Tea Spot", address: null, latitude: null, longitude: null, placeId: null },
    };
    const parsed = parseDrinkInput(toActionInput(fromDrink(input)));
    expect(parsed).toEqual({ ok: true, value: input });
  });

  it("rejects a decimal custom percent", () => {
    const state = { ...fromDrink({ ...emptyFormInput }), sugar: "12.5" };
    expect(parseDrinkInput(toActionInput(state))).toMatchObject({ ok: false, errors: { sugarPercent: expect.any(String) } });
  });
});

const emptyFormInput = {
  drinkName: "A",
  date: "2026-10-24",
  size: "M",
  sugarPercent: 50,
  icePercent: 50,
  toppings: [],
  rating: null,
  shop: { name: "S", address: null, latitude: null, longitude: null, placeId: null },
};
