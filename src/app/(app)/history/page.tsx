import Link from "next/link";
import { Suspense } from "react";
import { DrinkActions } from "@/components/DrinkActions";
import { DrinkCard } from "@/components/DrinkCard";
import { GlassCard } from "@/components/GlassCard";
import { SortSelect } from "@/components/history/SortSelect";
import { accentButtonClass } from "@/components/log/Field";
import { listDrinks, type DrinkLog } from "@/lib/drinks";
import { formatDayHeading, groupByDay } from "@/lib/historyGroups";
import { isRatingSort, parseHistorySort, sortDrinks } from "@/lib/historySort";

type SearchParams = PageProps<"/history">["searchParams"];

export default function Page({ searchParams }: PageProps<"/history">) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-5 py-6">
      <h1 className="text-4xl font-bold tracking-tight">History</h1>
      <Suspense fallback={<p className="text-ink-muted">Loading...</p>}>
        <DrinkList searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function DrinkList({ searchParams }: { searchParams: SearchParams }) {
  const sort = parseHistorySort((await searchParams).sort);
  const drinks = sortDrinks(await listDrinks(), sort);
  if (drinks.length === 0) {
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
      <SortSelect value={sort} />
      {isRatingSort(sort) ? (
        <div className="flex flex-col gap-3">
          {drinks.map((drink) => (
            <Card key={drink.id} drink={drink} showDate />
          ))}
        </div>
      ) : (
        groupByDay(drinks).map((group) => (
          <section key={group.day} className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-ink-muted">{formatDayHeading(group.day)}</h2>
            {group.drinks.map((drink) => (
              <Card key={drink.id} drink={drink} />
            ))}
          </section>
        ))
      )}
    </div>
  );
}

function Card({ drink, showDate }: { drink: DrinkLog; showDate?: boolean }) {
  return <DrinkCard drink={drink} showDate={showDate} actions={<DrinkActions id={drink.id} />} />;
}
