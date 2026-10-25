import type { ReactNode } from "react";

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export const inputClass = `glass min-h-11 w-full rounded-full px-4 py-2.5 placeholder:text-ink-muted ${focusRing}`;
export const pillButtonClass = `glass min-h-11 rounded-full px-4 py-2.5 font-medium transition disabled:opacity-50 ${focusRing}`;
export const accentButtonClass = `min-h-12 rounded-full bg-accent px-6 py-3 font-semibold text-on-accent transition disabled:opacity-60 ${focusRing}`;
export const labelClass = "mb-3 block text-sm font-semibold text-ink-muted";

export function FieldError({ id, children }: { id?: string; children?: ReactNode }) {
  if (!children) return null;
  return (
    <p id={id} role="alert" className="mt-2 text-sm font-medium text-danger">
      {children}
    </p>
  );
}

/** A labelled text-like input with its error underneath. */
export function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      {children}
      <FieldError id={`${id}-error`}>{error}</FieldError>
    </div>
  );
}
