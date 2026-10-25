"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { inputClass } from "@/components/log/Field";
import { DEFAULT_HISTORY_SORT, HISTORY_SORTS, parseHistorySort, type HistorySort } from "@/lib/historySort";

/** Keeps the choice in `?sort=` so it survives reloads and the back button. */
export function SortSelect({ value }: { value: HistorySort }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function change(raw: string) {
    const sort = parseHistorySort(raw);
    const href = sort === DEFAULT_HISTORY_SORT ? "/history" : `/history?sort=${sort}`;
    startTransition(() => router.replace(href, { scroll: false }));
  }

  return (
    <div className="flex items-center justify-end gap-3">
      <label htmlFor="history-sort" className="text-sm font-semibold text-ink-muted">
        Sort
      </label>
      <div className="relative">
        <select
          id="history-sort"
          value={value}
          onChange={(e) => change(e.target.value)}
          aria-busy={pending}
          className={`${inputClass} w-auto appearance-none pr-10 font-medium ${pending ? "opacity-60" : ""}`}
        >
          {HISTORY_SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-ink-muted"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="m5 8 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
