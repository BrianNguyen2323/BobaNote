"use client";

import { useState } from "react";
import { ChipGroup } from "../ChipGroup";
import { FieldError, inputClass } from "./Field";

const OTHER = "other";

type Props = {
  label: string;
  name: string;
  presets: readonly (string | number)[];
  /** Chip text for a preset, such as `50%`. */
  format?: (preset: string) => string;
  value: string;
  onChange: (value: string) => void;
  /** "numeric" shows the number pad and restricts the field to whole numbers. */
  inputMode: "text" | "numeric";
  error?: string;
};

/** Preset chips plus an "Other" chip that reveals a custom input. */
export function PresetOrCustom({ label, name, presets, format = (p) => p, value, onChange, inputMode, error }: Props) {
  const values = presets.map(String);
  const [other, setOther] = useState(value !== "" && !values.includes(value));
  const options = [...values.map((v) => ({ value: v, label: format(v) })), { value: OTHER, label: "Other" }];
  const selected = other ? OTHER : value || null;

  return (
    <div>
      <ChipGroup
        label={label}
        name={name}
        options={options}
        value={selected}
        onChange={(v) => {
          setOther(v === OTHER);
          // Switching to Other keeps a custom value, but clears a preset so the field starts empty.
          if (v !== OTHER) onChange(v);
          else if (values.includes(value)) onChange("");
        }}
      />
      {other && (
        <input
          type="text"
          inputMode={inputMode}
          pattern={inputMode === "numeric" ? "[0-9]*" : undefined}
          aria-label={`Custom ${label.toLowerCase()}`}
          aria-describedby={error ? `${name}-error` : undefined}
          placeholder={inputMode === "numeric" ? "Percent, such as 120" : "Custom size"}
          className={`${inputClass} mt-3`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      <FieldError id={`${name}-error`}>{error}</FieldError>
    </div>
  );
}
