import { Suspense } from "react";
import { signInWithGoogle } from "@/app/auth/actions";
import { GlassCard } from "@/components/GlassCard";
import { GoogleIcon } from "@/components/GoogleIcon";

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-6 px-5 py-10">
      <header>
        <h1 className="text-4xl font-bold tracking-tight">Boba Note</h1>
        <p className="mt-1 text-ink-muted">Log your boba and see your habits over time.</p>
      </header>
      <GlassCard className="flex flex-col gap-4">
        <form action={signInWithGoogle}>
          <button
            type="submit"
            className="glass flex min-h-12 w-full items-center justify-center gap-3 rounded-full px-5 font-semibold transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <GoogleIcon />
            Continue with Google
          </button>
        </form>
        <Suspense>
          <SignInError searchParams={searchParams} />
        </Suspense>
      </GlassCard>
    </main>
  );
}

async function SignInError({ searchParams }: Pick<PageProps<"/login">, "searchParams">) {
  const { error } = await searchParams;
  if (!error) {
    return null;
  }
  return (
    <p role="alert" className="text-center text-sm text-ink-muted">
      Sign-in didn&apos;t finish. Try again.
    </p>
  );
}
