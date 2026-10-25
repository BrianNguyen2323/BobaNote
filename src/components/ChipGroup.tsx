"use client";

type Option<T> = { value: T; label: string };

type ChipGroupProps<T> = {
  label: string;
  name: string;
  options: readonly Option<T>[];
  value: T | null;
  onChange: (value: T) => void;
};

export function ChipGroup<T>({ label, name, options, value, onChange }: ChipGroupProps<T>) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-semibold text-ink-muted">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option, index) => (
          <label key={index} className="cursor-pointer">
            <input
              type="radio"
              name={name}
              className="peer sr-only"
              checked={option.value === value}
              onChange={() => onChange(option.value)}
            />
            <span className="glass block min-h-11 min-w-14 rounded-full px-4 py-2.5 text-center font-medium transition peer-checked:border-transparent peer-checked:bg-accent peer-checked:text-on-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent">
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
