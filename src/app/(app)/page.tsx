import { Suspense } from "react";
import { DrinkForm } from "@/components/log/DrinkForm";
import { pastDrinkNames, recentShops } from "@/lib/drinkHistory";
import { getDrink, listDrinks } from "@/lib/drinks";

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-5 py-6">
      <h1 className="text-4xl font-bold tracking-tight">Log a drink</h1>
      <Suspense fallback={<p className="text-ink-muted">Loading...</p>}>
        <LogForm searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function LogForm({ searchParams }: { searchParams: PageProps<"/">["searchParams"] }) {
  const { from } = await searchParams;
  const [drinks, source] = await Promise.all([listDrinks(), typeof from === "string" ? getDrink(from).catch(() => null) : null]);
  // "Log again" copies everything except the id and created time. The form swaps the date for today.
  const initial = source ?? undefined;
  return <DrinkForm mode="create" initial={initial} suggestions={pastDrinkNames(drinks)} recentShops={recentShops(drinks)} />;
}
