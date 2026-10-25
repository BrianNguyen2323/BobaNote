import { Suspense } from "react";
import { DrinkForm } from "@/components/log/DrinkForm";
import { pastDrinkNames, recentShops } from "@/lib/drinkHistory";
import { getDrink, listDrinks } from "@/lib/drinks";

export default function EditDrink({ params }: PageProps<"/drinks/[id]/edit">) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-5 py-6">
      <h1 className="text-4xl font-bold tracking-tight">Edit drink</h1>
      <Suspense fallback={<p className="text-ink-muted">Loading...</p>}>
        <EditForm params={params} />
      </Suspense>
    </main>
  );
}

async function EditForm({ params }: { params: PageProps<"/drinks/[id]/edit">["params"] }) {
  const { id } = await params;
  const [drinks, drink] = await Promise.all([listDrinks(), getDrink(id).catch(() => null)]);
  if (!drink) {
    return <p className="glass rounded-glass p-5">That drink doesn&apos;t exist, or it isn&apos;t yours.</p>;
  }
  return <DrinkForm mode="edit" drinkId={drink.id} initial={drink} suggestions={pastDrinkNames(drinks)} recentShops={recentShops(drinks)} />;
}
