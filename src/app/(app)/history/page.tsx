import Link from "next/link";
import { Suspense } from "react";
import { DrinkActions } from "@/components/DrinkActions";
import { DrinkCard } from "@/components/DrinkCard";
import { GlassCard } from "@/components/GlassCard";
import { accentButtonClass } from "@/components/log/Field";
import { listDrinks } from "@/lib/drinks";
import { formatDayHeading, groupByDay } from "@/lib/historyGroups";

export default function Page() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-5 py-6">
      <h1 className="text-4xl font-bold tracking-tight">History</h1>
      <Suspense fallback={<p className="text-ink-muted">Loading...</p>}>
        <DrinkList />
      </Suspense>
    </main>
  );
}

async function DrinkList() {
  const groups = groupByDay(await listDrinks());
  if (groups.length === 0) {
    return (
      <GlassCard className="flex flex-col items-start gap-4">
        <p className="text-ink-muted">No drinks yet. Log your first one.</p>
        <Link href="/" className={`${accentButtonClass} inline-flex items-center`}>
          Log a drink
        </Link>
      </GlassCard>
    );
  }
  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <section key={group.day} className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-ink-muted">{formatDayHeading(group.day)}</h2>
          {group.drinks.map((drink) => (
            <DrinkCard key={drink.id} drink={drink} actions={<DrinkActions id={drink.id} />} />
          ))}
        </section>
      ))}
    </div>
  );
}
