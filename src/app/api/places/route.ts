import { NextResponse, type NextRequest } from "next/server";
import { parseShopSearch, searchShops } from "@/lib/places";
import { createClient } from "@/lib/supabase/server";

// Signed-in users only, so strangers can't spend the Places quota.
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  const search = parseShopSearch(request.nextUrl.searchParams);
  if (!search) {
    return NextResponse.json({ error: "Send q, or lat and lng, or both." }, { status: 400 });
  }

  try {
    return NextResponse.json({ shops: await searchShops(search) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Shop search failed." }, { status: 502 });
  }
}
