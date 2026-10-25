"use client";

import Link from "next/link";
import { useState, useSyncExternalStore, useTransition } from "react";
import { createDrinkAction, type SaveResult, updateDrinkAction } from "@/app/(app)/drinks/actions";
import { ChipGroup } from "@/components/ChipGroup";
import { GlassCard } from "@/components/GlassCard";
import { toIsoDay } from "@/lib/dates";
import { emptyForm, type FormState, fromDrink, toActionInput } from "@/lib/drinkForm";
import type { DrinkErrors, DrinkInput, Shop } from "@/lib/drinks";
import { PERCENT_PRESETS, RATING_MAX, RATING_MIN, SIZE_PRESETS } from "@/lib/presets";
import { DrinkNameField } from "./DrinkNameField";
import { accentButtonClass, Field, FieldError, inputClass } from "./Field";
import { PresetOrCustom } from "./PresetOrCustom";
import { ShopPicker } from "./ShopPicker";
import { ToppingPicker } from "./ToppingPicker";

type Props = {
  mode: "create" | "edit";
  drinkId?: string;
  initial?: DrinkInput;
  suggestions: string[];
  recentShops: Shop[];
};

const RATINGS = [
  { value: null, label: "Skip" },
  ...Array.from({ length: RATING_MAX - RATING_MIN + 1 }, (_, i) => ({ value: RATING_MIN + i, label: String(RATING_MIN + i) })),
];

const noSubscription = () => () => {};
const percent = (p: string) => `${p}%`;

export function DrinkForm({ mode, drinkId, initial, suggestions, recentShops }: Props) {
  // "Log again" and a fresh form start with no date, which means today. See `date` below.
  const [form, setForm] = useState<FormState>(() => {
    const state = initial ? fromDrink(initial) : emptyForm;
    return mode === "create" ? { ...state, date: "" } : state;
  });
  const [errors, setErrors] = useState<DrinkErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [saving, startSaving] = useTransition();

  // The server can't know the user's local day, so read it in the browser (empty during server render).
  const today = useSyncExternalStore(noSubscription, () => toIsoDay(new Date()), () => "");
  const date = form.date || today;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  };

  function submit(event: React.FormEvent) {
    event.preventDefault();
    startSaving(async () => {
      const input = toActionInput({ ...form, date });
      const result: SaveResult =
        mode === "edit" && drinkId ? await updateDrinkAction(drinkId, input) : await createDrinkAction(input);
      if (!result.ok) {
        setErrors(result.errors);
        setMessage(result.message ?? "Fix the highlighted fields.");
        return;
      }
      setErrors({});
      setMessage(null);
      setSaved(true);
      setForm({ ...emptyForm, date: form.date });
      setResetKey((k) => k + 1);
    });
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      <GlassCard key={resetKey} className="flex flex-col gap-6">
        <ShopPicker value={form.shop} onChange={(v) => set("shop", v)} recentShops={recentShops} error={errors.shop} />
        <DrinkNameField value={form.drinkName} onChange={(v) => set("drinkName", v)} suggestions={suggestions} error={errors.drinkName} />
        <PresetOrCustom label="Size" name="size" presets={SIZE_PRESETS} value={form.size} onChange={(v) => set("size", v)} inputMode="text" error={errors.size} />
        <PresetOrCustom label="Sugar" name="sugar" presets={PERCENT_PRESETS} format={percent} value={form.sugar} onChange={(v) => set("sugar", v)} inputMode="numeric" error={errors.sugarPercent} />
        <PresetOrCustom label="Ice" name="ice" presets={PERCENT_PRESETS} format={percent} value={form.ice} onChange={(v) => set("ice", v)} inputMode="numeric" error={errors.icePercent} />
        <ToppingPicker value={form.toppings} onChange={(v) => set("toppings", v)} error={errors.toppings} />
        <div>
          <ChipGroup label="Rating" name="rating" options={RATINGS} value={form.rating} onChange={(v) => set("rating", v)} />
          <FieldError>{errors.rating}</FieldError>
        </div>
        <Field id="drink-date" label="Date" error={errors.date}>
          <input id="drink-date" type="date" className={inputClass} value={date} max={today || undefined} onChange={(e) => set("date", e.target.value)} />
        </Field>
      </GlassCard>

      {message && <FieldError>{message}</FieldError>}
      {saved && (
        <p role="status" className="glass rounded-glass p-4 font-semibold">
          Logged! <Link href="/history" className="text-accent-ink underline">See History</Link>
        </p>
      )}
      <button type="submit" className={accentButtonClass} disabled={saving}>
        {saving ? "Saving..." : mode === "edit" ? "Save changes" : "Log drink"}
      </button>
    </form>
  );
}
