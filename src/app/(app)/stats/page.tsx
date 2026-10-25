import { Suspense } from "react";
import { StatsView } from "../../../components/stats/StatsView";
import { listDrinks } from "../../../lib/drinks";

async function Stats() {
  return <StatsView drinks={await listDrinks()} />;
}

export default function Page() {
  return (
    <main className="mx-auto w-full max-w-md px-5 py-10">
      <h1 className="mb-6 text-4xl font-bold tracking-tight">Stats</h1>
      <Suspense fallback={<div className="h-96" aria-busy />}>
        <Stats />
      </Suspense>
    </main>
  );
}
