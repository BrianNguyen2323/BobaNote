"use client";

import { useState } from "react";
import { matchNames } from "@/lib/drinkHistory";
import { Field, inputClass } from "./Field";

type Props = { value: string; onChange: (value: string) => void; suggestions: string[]; error?: string };

export function DrinkNameField({ value, onChange, suggestions, error }: Props) {
  const [open, setOpen] = useState(false);
  const matches = open ? matchNames(suggestions, value) : [];

  return (
    <Field id="drink-name" label="Drink" error={error}>
      <div className="relative" onBlur={() => setOpen(false)}>
        <input
          id="drink-name"
          type="text"
          autoComplete="off"
          placeholder="Brown sugar milk tea"
          className={inputClass}
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "drink-name-error" : undefined}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
        />
        {matches.length > 0 && (
          // mousedown would blur the input and unmount the list before the click lands.
          <ul aria-label="Past drinks" className="absolute inset-x-0 top-full z-10 mt-2 overflow-hidden rounded-glass bg-surface shadow-lg ring-1 ring-ink-muted/30" onMouseDown={(e) => e.preventDefault()}>
            {matches.map((name) => (
              <li key={name}>
                <button
                  type="button"
                  className="min-h-11 w-full px-4 py-2.5 text-left font-medium focus-visible:bg-accent focus-visible:text-on-accent"
                  onClick={() => {
                    onChange(name);
                    setOpen(false);
                  }}
                >
                  {name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Field>
  );
}
