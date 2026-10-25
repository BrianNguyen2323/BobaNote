// Signs in the test user from .env.local (E2E_TEST_EMAIL, E2E_TEST_PASSWORD) and prints
// agent-browser commands that load the same session cookies the app sets after a real sign-in.
// Usage: node scripts/test-session.mjs [baseUrl]   then run the printed commands.
import { readFileSync } from "node:fs";
import { createServerClient } from "@supabase/ssr";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((line) => /^[A-Z0-9_]+=/.test(line))
    .map((line) => [line.slice(0, line.indexOf("=")), line.slice(line.indexOf("=") + 1).trim()]),
);

for (const name of ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "E2E_TEST_EMAIL", "E2E_TEST_PASSWORD"]) {
  if (!env[name]) {
    console.error(`Missing ${name} in .env.local`);
    process.exit(1);
  }
}

const baseUrl = process.argv[2] ?? "http://localhost:3000";
const jar = new Map();
const supabase = createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
  cookies: {
    getAll: () => [...jar].map(([name, value]) => ({ name, value })),
    setAll: (cookies) => cookies.forEach(({ name, value }) => jar.set(name, value)),
  },
});

const { error } = await supabase.auth.signInWithPassword({ email: env.E2E_TEST_EMAIL, password: env.E2E_TEST_PASSWORD });
if (error) {
  console.error(`Test sign-in failed: ${error.message}`);
  process.exit(1);
}

for (const [name, value] of jar) {
  console.log(`agent-browser cookies set '${name}' '${value}' --url ${baseUrl}`);
}
