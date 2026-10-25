function required(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing ${name}. Copy .env.example to .env.local, fill it in, and restart the dev server.`);
  }
  return value;
}

export const supabaseUrl = () => required(process.env.NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL");

export const supabasePublishableKey = () =>
  required(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");

export const googlePlacesApiKey = () => required(process.env.GOOGLE_PLACES_API_KEY, "GOOGLE_PLACES_API_KEY");
