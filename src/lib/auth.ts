import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type CurrentUser = { id: string; email: string | null; name: string | null };

export async function getCurrentUser(): Promise<CurrentUser> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) {
    redirect("/login");
  }
  const metadata = claims.user_metadata as { full_name?: string } | undefined;
  return { id: claims.sub, email: claims.email ?? null, name: metadata?.full_name ?? null };
}
