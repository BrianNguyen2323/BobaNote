import { Suspense } from "react";
import { signOut } from "@/app/auth/actions";
import { TabBar } from "@/components/TabBar";
import { getCurrentUser } from "@/lib/auth";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="pb-tab-bar">
      <Suspense fallback={<div className="mx-auto h-12 max-w-md" />}>
        <AccountLine />
      </Suspense>
      {children}
      <Suspense fallback={null}>
        <TabBar />
      </Suspense>
    </div>
  );
}

async function AccountLine() {
  const user = await getCurrentUser();
  return (
    <div className="mx-auto flex max-w-md items-center justify-between gap-3 px-5 pt-3 text-sm">
      <span className="truncate text-ink-muted">Signed in as {user.name ?? user.email}</span>
      <form action={signOut}>
        <button type="submit" className="min-h-11 shrink-0 whitespace-nowrap rounded-full px-3 font-semibold text-accent-ink">
          Sign out
        </button>
      </form>
    </div>
  );
}
