"use client";

import { useState } from "react";
import { TOPPING_PRESETS } from "@/lib/presets";
import { FieldError, inputClass, pillButtonClass } from "./Field";

type Props = { value: string[]; onChange: (value: string[]) => void; error?: string };

const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

/** Multi-select chips on native checkboxes, same look as ChipGroup. Custom toppings join the list once added. */
export function ToppingPicker({ value, onChange, error }: Props) {
  const [draft, setDraft] = useState("");
  const custom = value.filter((t) => !TOPPING_PRESETS.some((p) => same(p, t)));
  const chips = [...TOPPING_PRESETS, ...custom];

  function toggle(topping: string) {
    onChange(value.some((t) => same(t, topping)) ? value.filter((t) => !same(t, topping)) : [...value, topping]);
  }

  function add() {
    const name = draft.trim().replace(/\s+/g, " ");
    if (name && !value.some((t) => same(t, name))) onChange([...value, name]);
    setDraft("");
  }

  return (
    <fieldset>
      <legend className="mb-3 text-sm font-semibold text-ink-muted">Toppings</legend>
      <div className="flex flex-wrap gap-2">
        {chips.map((topping) => (
          <label key={topping} className="cursor-pointer">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={value.some((t) => same(t, topping))}
              onChange={() => toggle(topping)}
            />
            <span className="glass block min-h-11 rounded-full px-4 py-2.5 text-center font-medium transition peer-checked:border-transparent peer-checked:bg-accent peer-checked:text-on-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent">
              {topping}
            </span>
          </label>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          type="text"
          aria-label="Custom topping"
          placeholder="Add your own"
          className={inputClass}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <button type="button" className={pillButtonClass} onClick={add}>
          Add
        </button>
      </div>
      <FieldError id="toppings-error">{error}</FieldError>
    </fieldset>
  );
}
