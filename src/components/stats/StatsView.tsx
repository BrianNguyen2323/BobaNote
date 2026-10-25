"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import type { DrinkLog } from "../../lib/drinks";
import { bucketCounts, periodLabel, periodRange, shiftAnchor, topDrinks, type Period } from "../../lib/stats";
import { toIsoDay } from "../../lib/dates";
import { ChipGroup } from "../ChipGroup";
import { GlassCard } from "../GlassCard";
import { BarChart } from "./BarChart";
import { TopDrinks } from "./TopDrinks";

const PERIODS = [
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
] as const;

const noSubscription = () => () => {};

function ArrowButton({ label, direction, disabled, onClick }: { label: string; direction: "back" | "forward"; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="glass flex size-11 shrink-0 items-center justify-center rounded-full text-xl transition disabled:opacity-30"
    >
      <span aria-hidden>{direction === "back" ? "‹" : "›"}</span>
    </button>
  );
}

export function StatsView({ drinks }: { drinks: DrinkLog[] }) {
  // Today comes from the browser clock. The server snapshot is null, so the server never renders a date.
  const today = useSyncExternalStore(noSubscription, () => toIsoDay(new Date()), () => null);
  const [period, setPeriod] = useState<Period>("week");
  const [pickedAnchor, setPickedAnchor] = useState<string | null>(null);

  if (today === null) {
    return <div className="h-96" aria-busy />;
  }

  const anchor = pickedAnchor ?? today;
  const { start, end } = periodRange(period, anchor);
  const total = drinks.filter((d) => d.date >= start && d.date <= end).length;

  return (
    <div className="flex flex-col gap-5">
      <GlassCard>
        <ChipGroup label="Period" name="period" options={PERIODS} value={period} onChange={setPeriod} />
      </GlassCard>

      <div className="flex items-center gap-3">
        <ArrowButton label={`Previous ${period}`} direction="back" onClick={() => setPickedAnchor(shiftAnchor(period, anchor, -1))} />
        <p className="min-w-0 flex-1 text-center font-semibold" aria-live="polite">
          {periodLabel(period, start, end)}
        </p>
        <ArrowButton label={`Next ${period}`} direction="forward" disabled={end >= today} onClick={() => setPickedAnchor(shiftAnchor(period, anchor, 1))} />
      </div>

      {drinks.length === 0 ? (
        <GlassCard className="text-center">
          <p className="font-semibold">No drinks logged yet.</p>
          <p className="mt-1 text-ink-muted">
            <Link href="/" className="font-semibold text-accent-ink underline">Log your first drink</Link> and your stats show up here.
          </p>
        </GlassCard>
      ) : total === 0 ? (
        <GlassCard className="text-center">
          <p className="font-semibold">No drinks in this {period}.</p>
          <p className="mt-1 text-ink-muted">Use the arrows to look at another {period}.</p>
        </GlassCard>
      ) : (
        <>
          <GlassCard>
            <p className="text-sm font-semibold text-ink-muted">Drinks</p>
            <p className="mb-4 text-4xl font-bold tracking-tight">{total}</p>
            <BarChart buckets={bucketCounts(drinks, period, anchor)} period={period} today={today} />
          </GlassCard>
          <GlassCard>
            <h2 className="mb-3 text-sm font-semibold text-ink-muted">Top drinks</h2>
            <TopDrinks drinks={topDrinks(drinks, start, end)} />
          </GlassCard>
        </>
      )}
    </div>
  );
}
