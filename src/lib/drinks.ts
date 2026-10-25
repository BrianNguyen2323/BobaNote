import { isIsoDay } from "./dates";
import { RATING_MAX, RATING_MIN } from "./presets";
import { createClient } from "./supabase/server";

export type Shop = {
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  placeId: string | null;
};

export type DrinkLog = {
  id: string;
  drinkName: string;
  date: string;
  size: string;
  sugarPercent: number;
  icePercent: number;
  toppings: string[];
  rating: number | null;
  shop: Shop;
  createdAt: string;
};

export type DrinkInput = Omit<DrinkLog, "id" | "createdAt">;

export type DrinkRow = {
  id: string;
  drink_name: string;
  date: string;
  size: string;
  sugar_percent: number;
  ice_percent: number;
  toppings: string[];
  rating: number | null;
  shop_name: string;
  shop_address: string | null;
  shop_latitude: number | null;
  shop_longitude: number | null;
  shop_place_id: string | null;
  created_at: string;
};

export function rowToDrink(row: DrinkRow): DrinkLog {
  return {
    id: row.id,
    drinkName: row.drink_name,
    date: row.date,
    size: row.size,
    sugarPercent: row.sugar_percent,
    icePercent: row.ice_percent,
    toppings: row.toppings,
    rating: row.rating,
    shop: {
      name: row.shop_name,
      address: row.shop_address,
      latitude: row.shop_latitude,
      longitude: row.shop_longitude,
      placeId: row.shop_place_id,
    },
    createdAt: row.created_at,
  };
}

// No user_id: the column defaults to auth.uid().
export function drinkToRow(input: DrinkInput): Omit<DrinkRow, "id" | "created_at"> {
  return {
    drink_name: input.drinkName,
    date: input.date,
    size: input.size,
    sugar_percent: input.sugarPercent,
    ice_percent: input.icePercent,
    toppings: input.toppings,
    rating: input.rating,
    shop_name: input.shop.name,
    shop_address: input.shop.address,
    shop_latitude: input.shop.latitude,
    shop_longitude: input.shop.longitude,
    shop_place_id: input.shop.placeId,
  };
}

export type DrinkErrors = Partial<Record<keyof DrinkInput | "shop", string>>;
export type ParseResult = { ok: true; value: DrinkInput } | { ok: false; errors: DrinkErrors };

type Raw = Record<string, unknown>;
const isRecord = (v: unknown): v is Raw => typeof v === "object" && v !== null && !Array.isArray(v);
const text = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const optionalText = (v: unknown) => text(v) || null;
const optionalNumber = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
const isCount = (v: unknown): v is number => typeof v === "number" && Number.isInteger(v) && v >= 0;

function parseToppings(v: unknown): string[] | null {
  if (!Array.isArray(v) || v.some((t) => text(t) === "")) {
    return null;
  }
  const seen = new Set<string>();
  return v.map(text).filter((t) => !seen.has(t.toLowerCase()) && seen.add(t.toLowerCase()));
}

function parseShop(v: unknown): Shop | null {
  if (!isRecord(v) || text(v.name) === "") {
    return null;
  }
  const nullable = (n: unknown) => n === null || n === undefined || optionalNumber(n) !== null;
  if (![v.latitude, v.longitude].every(nullable)) {
    return null;
  }
  return {
    name: text(v.name),
    address: optionalText(v.address),
    latitude: optionalNumber(v.latitude),
    longitude: optionalNumber(v.longitude),
    placeId: optionalText(v.placeId),
  };
}

export function parseDrinkInput(value: unknown): ParseResult {
  const v: Raw = isRecord(value) ? value : {};
  const errors: DrinkErrors = {};
  const drinkName = text(v.drinkName);
  const date = text(v.date);
  const size = text(v.size);
  const toppings = parseToppings(v.toppings);
  const shop = parseShop(v.shop);
  const rating = v.rating ?? null;

  if (!drinkName) errors.drinkName = "Enter a drink name.";
  if (!isIsoDay(date)) errors.date = "Pick a real date.";
  if (!size) errors.size = "Pick a size.";
  if (!isCount(v.sugarPercent)) errors.sugarPercent = "Sugar must be a whole number, 0 or more.";
  if (!isCount(v.icePercent)) errors.icePercent = "Ice must be a whole number, 0 or more.";
  if (!toppings) errors.toppings = "Toppings must be non-empty names.";
  if (rating !== null && !(Number.isInteger(rating) && (rating as number) >= RATING_MIN && (rating as number) <= RATING_MAX)) {
    errors.rating = `Rating must be ${RATING_MIN} to ${RATING_MAX}, or skipped.`;
  }
  if (!shop) errors.shop = "Enter a shop name.";

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }
  return {
    ok: true,
    value: {
      drinkName,
      date,
      size,
      sugarPercent: v.sugarPercent as number,
      icePercent: v.icePercent as number,
      toppings: toppings!,
      rating: rating as number | null,
      shop: shop!,
    },
  };
}

export async function listDrinks(): Promise<DrinkLog[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("drink_logs")
    .select("*")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as DrinkRow[]).map(rowToDrink);
}

export async function getDrink(id: string): Promise<DrinkLog | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("drink_logs").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? rowToDrink(data as DrinkRow) : null;
}

export async function createDrink(input: DrinkInput): Promise<DrinkLog> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("drink_logs").insert(drinkToRow(input)).select().single();
  if (error) throw new Error(error.message);
  return rowToDrink(data as DrinkRow);
}

export async function updateDrink(id: string, input: DrinkInput): Promise<DrinkLog> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("drink_logs").update(drinkToRow(input)).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return rowToDrink(data as DrinkRow);
}

export async function deleteDrink(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("drink_logs").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
