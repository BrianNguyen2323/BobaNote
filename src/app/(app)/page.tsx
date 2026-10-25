import { StylePreview } from "./StylePreview";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-5 py-10">
      <header>
        <p className="text-sm font-semibold uppercase tracking-widest text-accent-ink">Style preview</p>
        <h1 className="text-4xl font-bold tracking-tight">Boba Note</h1>
        <p className="mt-1 text-ink-muted">Phase 2 replaces this page with the log form.</p>
      </header>
      <StylePreview />
    </main>
  );
}
