import { Suspense } from "react";
import { GlassCard } from "@/components/GlassCard";
import { getCurrentUser } from "@/lib/auth";
import { listDrinks } from "@/lib/drinks";

export default function DebugPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-4 px-5 py-10">
      <h1 className="text-4xl font-bold tracking-tight">Debug</h1>
      <Suspense fallback={<GlassCard>Loading...</GlassCard>}>
        <DebugInfo />
      </Suspense>
    </main>
  );
}

async function DebugInfo() {
  const user = await getCurrentUser();
  let count: number | null = null;
  let error: string | null = null;
  try {
    count = (await listDrinks()).length;
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }
  return (
    <>
      <GlassCard>
        <p className="text-sm text-ink-muted">User id</p>
        <p className="break-all font-semibold">{user.id}</p>
      </GlassCard>
      <GlassCard>
        <p className="text-sm text-ink-muted">Drinks</p>
        <p className="font-semibold">{count ?? "unknown"}</p>
      </GlassCard>
      <GlassCard>
        <p className="text-sm text-ink-muted">Last error</p>
        <p className="break-words font-semibold">{error ?? "none"}</p>
      </GlassCard>
    </>
  );
}
