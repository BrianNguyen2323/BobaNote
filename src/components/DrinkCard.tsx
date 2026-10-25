import type { ReactNode } from "react";
import type { DrinkLog } from "@/lib/drinks";
import { formatDayHeading } from "@/lib/historyGroups";
import { GlassCard } from "./GlassCard";

const chipClass = "rounded-full bg-accent/15 px-3 py-1 text-sm font-medium text-accent-ink";

/** One logged drink. `actions` renders under the details. `showDate` is for lists without day headings. */
export function DrinkCard({ drink, actions, showDate = false }: { drink: DrinkLog; actions?: ReactNode; showDate?: boolean }) {
  return (
    <GlassCard className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold break-words">{drink.drinkName}</h3>
          <p className="text-sm text-ink-muted break-words">{drink.shop.name}</p>
          {showDate && <p className="text-sm text-ink-muted">{formatDayHeading(drink.date)}</p>}
        </div>
        {drink.rating !== null && (
          <p className="shrink-0 rounded-full bg-accent px-3 py-1 text-sm font-semibold text-on-accent" aria-label={`Rating ${drink.rating} out of 10`}>
            {drink.rating}/10
          </p>
        )}
      </div>
      <ul className="flex flex-wrap gap-2">
        <li className={chipClass}>Size {drink.size}</li>
        <li className={chipClass}>Sugar {drink.sugarPercent}%</li>
        <li className={chipClass}>Ice {drink.icePercent}%</li>
      </ul>
      {drink.toppings.length > 0 && <p className="text-sm text-ink-muted">{drink.toppings.join(", ")}</p>}
      {actions}
    </GlassCard>
  );
}
