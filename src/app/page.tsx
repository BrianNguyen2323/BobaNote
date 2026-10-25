import { Suspense } from "react";
import { signOut } from "@/app/auth/actions";
import { getCurrentUser } from "@/lib/auth";
import { StylePreview } from "./StylePreview";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-5 py-10">
      <header>
        <p className="text-sm font-semibold uppercase tracking-widest text-accent-ink">Style preview</p>
        <h1 className="text-4xl font-bold tracking-tight">Boba Note</h1>
        <p className="mt-1 text-ink-muted">Phase 2 replaces this page with the log form.</p>
        <Suspense fallback={<p className="mt-3 h-6" />}>
          <AccountBar />
        </Suspense>
      </header>
      <StylePreview />
    </main>
  );
}

async function AccountBar() {
  const user = await getCurrentUser();
  return (
    <div className="mt-3 flex items-center justify-between gap-3 text-sm">
      <span className="truncate text-ink-muted">Signed in as {user.name ?? user.email}</span>
      <form action={signOut}>
        <button type="submit" className="min-h-11 rounded-full px-3 font-semibold text-accent-ink">
          Sign out
        </button>
      </form>
    </div>
  );
}
