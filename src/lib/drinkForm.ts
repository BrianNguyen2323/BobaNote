import type { DrinkInput, Shop } from "./drinks";

/** What the form holds while the user edits. Sugar and ice stay text so a half-typed number is representable. */
export type FormState = {
  drinkName: string;
  date: string;
  size: string;
  sugar: string;
  ice: string;
  toppings: string[];
  rating: number | null;
  shop: Shop | null;
};

export const emptyForm: FormState = {
  drinkName: "",
  date: "",
  size: "",
  sugar: "",
  ice: "",
  toppings: [],
  rating: null,
  shop: null,
};

export function fromDrink(d: DrinkInput): FormState {
  return {
    drinkName: d.drinkName,
    date: d.date,
    size: d.size,
    sugar: String(d.sugarPercent),
    ice: String(d.icePercent),
    toppings: d.toppings,
    rating: d.rating,
    shop: d.shop,
  };
}

// Blank becomes null (not 0) so parseDrinkInput rejects it instead of logging 0%.
const count = (s: string) => (s.trim() === "" ? null : Number(s));

/** The untrusted payload sent to the Server Action. parseDrinkInput validates it there. */
export function toActionInput(s: FormState): unknown {
  return {
    drinkName: s.drinkName,
    date: s.date,
    size: s.size,
    sugarPercent: count(s.sugar),
    icePercent: count(s.ice),
    toppings: s.toppings,
    rating: s.rating,
    shop: s.shop,
  };
}
