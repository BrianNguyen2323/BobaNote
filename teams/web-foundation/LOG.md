# Web foundation team (phase 0)

Branch: `phase-0/web-foundation`. Goal: replace the iOS project with a Next.js + Tailwind app that has the taro theme, the first liquid glass components, Google sign-in through Supabase, the `drink_logs` table, server-side Google Places search, and CI.

## Status

Auth, database schema, and Places code are written and pass lint, tests, and build. Blocked on the owner connecting the services: follow the README section "Connect the services" (Supabase project, SQL migration, Google sign-in client, Places key, `.env.local`). Then the owner runs step 5 of that section. If sign-in or the Places check fails, record the exact error here. The owner merges into `main` once sign-in works. Phase 1 (drink data module) starts after the merge.

## Done when

- [x] iOS files removed (`project.yml`, `BobaNote/`, `BobaNoteCore/`, the Xcode CI workflow, `teams/build-loop/`).
- [x] Next.js 16 app with Tailwind v4 at the repo root.
- [x] Taro theme tokens for light and dark mode in `src/app/globals.css`.
- [x] `glass` utility, `GlassCard`, and `ChipGroup`.
- [x] `normalizeDrinkName` with Vitest tests.
- [x] `npm run lint`, `npm test`, and `npm run build` pass locally.
- [x] Page checked in a browser at 390x844, in light and dark mode.
- [x] CI green on this branch.
- [x] Owner approves the look.
- [x] `.env.example` lists every variable with where to find it. `.env.local` exists and is ignored by git.
- [x] Google sign-in through Supabase (`/login`, `/auth/callback`, sign-out, `src/proxy.ts`).
- [x] `drink_logs` migration with row level security.
- [x] `/api/places` route with tested request parsing and response parsing.
- [ ] Owner connects Supabase, Google sign-in, and Places, and signs in locally.
- [ ] `/api/places?q=boba` returns shops for a signed-in user.
- [ ] CI green on the final commit, then merge into `main`.

## Provides

- **Theme tokens.** Defined in `src/app/globals.css` and used as Tailwind classes. Colors are `surface`, `ink`, `ink-muted`, `accent` (fills such as a selected chip), `accent-ink` (accent-colored text, lighter in dark mode), and `on-accent` (text on an accent fill). The radius is `rounded-glass`. Add a token in `globals.css` instead of using arbitrary values.
- **`glass` utility.** Translucent fill, blur and saturation, a bright top edge, and a soft shadow. Falls back to a solid fill under Reduce Transparency.
- **`GlassCard`** (`src/components/GlassCard.tsx`). A glass panel with padding. Takes `className` for layout.
- **`ChipGroup`** (`src/components/ChipGroup.tsx`). Single-choice chips built on native radio inputs. Props are `label`, `name`, `options` (`{ value, label }[]`), `value` (or `null` for nothing picked), and `onChange`. It is a client component.
- **Presets** (`src/lib/presets.ts`). `PERCENT_PRESETS`, `SIZE_PRESETS`, `TOPPING_PRESETS`, `RATING_MIN`, and `RATING_MAX`.
- **`normalizeDrinkName`** (`src/lib/drinkName.ts`). Trims, collapses inner whitespace, and lowercases.
- **Tests.** Vitest. Put `*.test.ts` next to the module. `npm test` runs them all once.
- **Sign-in.** Every page except `/login`, `/auth/*`, and `/api/*` redirects signed-out visitors to `/login` (`src/proxy.ts`). In a Server Component, call `getCurrentUser()` from `src/lib/auth.ts` inside `<Suspense>`. It returns `{ id, email, name }` or redirects to `/login`. `signInWithGoogle` and `signOut` are Server Actions in `src/app/auth/actions.ts`.
- **Supabase client.** `createClient()` from `src/lib/supabase/server.ts`, for Server Components, Server Actions, and Route Handlers. There is no browser client yet. Add one only when a client component needs Supabase directly.
- **`drink_logs` table.** Schema in `supabase/migrations/20261024000000_create_drink_logs.sql`. `user_id` defaults to the signed-in user, so inserts can leave it out. RLS limits every query to the user's own rows.
- **Shop search.** `GET /api/places?q=<text>&lat=<n>&lng=<n>`. Send `q`, or `lat` and `lng`, or both. Location alone means boba near me, ranked by distance. Returns `{ shops: ShopResult[] }`, where `ShopResult` is `{ placeId, name, address, latitude, longitude }` from `src/lib/places.ts`. Answers 401 when signed out, 400 for bad parameters, and 502 when Google fails.
- **Environment.** `src/lib/env.ts` exports one getter per variable. Each throws a message naming the missing variable.
- **Style preview page.** `src/app/page.tsx` and `src/app/StylePreview.tsx` are a placeholder. Phase 2 deletes `StylePreview.tsx` and replaces the page with the log form.

## Decisions

| Decision | Why |
|---|---|
| Scaffolded with `create-next-app@16.4.3` defaults (TypeScript, App Router, `src/`, ESLint, Turbopack, Cache Components) | Boring defaults. They match the Next.js docs bundled in `node_modules/next/dist/docs/`. |
| Kept Next's generated `AGENTS.md` | `next dev` re-creates it if deleted. It tells agents to read the bundled Next.js 16 docs. |
| System font stack, no `next/font` | SF Pro on Apple devices matches the Apple look. No font download, and no network request at build time. |
| Vitest as the only added package | CLAUDE.md requires stats tests. Node 22.17's built-in test runner can't run TypeScript without an experimental flag. |
| `@types/node` raised from 20 to 22 | Matches the Node version in `.nvmrc`. Vitest 5 refuses to install next to the v20 types. |
| `.nvmrc` pins Node 22 | CI reads it today and Netlify reads it later. One source of truth. |
| `ChipGroup` uses native radio inputs | Arrow-key navigation, form semantics, and screen reader support come free. |
| Glass is blur + saturation + highlight, no refraction | Safari can't apply SVG filters in `backdrop-filter`, and the owner's devices are iPhones. |
| Separate `accent-ink` token for accent text | `#6f4fa0` text is unreadable on the dark background. The browser check caught it. |
| No tab bar yet | There is only one page. Add the floating glass tab bar with the second page. |
| Supabase Auth for Google sign-in, no Auth.js | One system for login and data. RLS policies can check `auth.uid()` directly. |
| Sign-in and sign-out as Server Actions, no browser Supabase client | Nothing in the browser needs Supabase yet. Fewer files, and no client bundle cost. |
| `getClaims()` for auth checks, never `getSession()` | Supabase docs say `getSession()` must not be trusted in server code. `getClaims()` validates the token. |
| `/api` skipped by the proxy redirect | API callers get a JSON 401 from the route itself, not an HTML redirect to `/login`. |
| Places calls use Text Search with a 4-field mask | id, name, address, and location keep each call at the Pro rate. "Near me" is Text Search with `rankPreference: DISTANCE`, so one endpoint covers both nearby and named search. |
| `GOOGLE_PLACES_API_KEY` has no application restriction | Only our server calls Places, so browser referrer restrictions don't apply. The key is restricted to Places API (New), and the owner sets a daily quota and a budget alert. |
| `size`, `sugar_percent`, and `ice_percent` are NOT NULL, and `rating` is nullable | Matches the approved data model. Sugar and ice only check `>= 0`, so custom values such as 120% work. |
| Migrations pasted into the SQL editor | Owner chose this over the Supabase CLI and Docker. File names follow the CLI's `<timestamp>_<name>.sql` pattern so the CLI can take over later. |
| Relative imports inside `src/lib/` | Vitest does not resolve `@/`. This avoids a Vitest config file. |

## Log

- **2026-10-24.** Owner switched the project from iOS to a Next.js web app. Branched `phase-0/web-foundation` from `main` (`9bc4b3d`). Removed the iOS files and the `latest` iOS build process. Rewrote `CLAUDE.md`, `README.md`, and `teams/README.md` for the web stack. Added the scaffold, theme, `GlassCard`, `ChipGroup`, presets, `normalizeDrinkName` with two tests, and a Node CI workflow (lint, test, build). Locally, `npm run lint` reported no issues, `npm test` passed 2 of 2, and `npm run build` succeeded. In agent-browser at 390x844, light and dark mode both render. Tapping the ice "25%" chip changed the summary to "M, 50% sugar, 25% ice". The dark-mode screenshot showed the "Style preview" label unreadable, so `accent-ink` was added and the label rechecked.
- **Not done.** The GitHub `latest` release with the old `BobaNote.ipa`, and the remote branches `docs/claude-md-plan` and `phase-0/build-loop`, still exist. Deleting them is the owner's call.
- **2026-10-24.** CI passed on `c96d5d0`: [run 40161879031](https://github.com/BrianNguyen2323/BobaNote/actions/runs/40161879031). The `check` job ran lint, tests, and build on Ubuntu with Node from `.nvmrc`.
- **2026-10-24.** Owner approved the look and asked to delete the iOS leftovers. Deleted the remote and local branches `docs/claude-md-plan` and `phase-0/build-loop`. The `latest` release and its tag are still there, because deleting a release needs `gh auth login`. Owner chose Google Places for shops, Google sign-in, and Supabase for storage, all set up on this branch before the merge. A plan is waiting on owner approval.
- **2026-10-24.** Owner approved Google sign-in through Supabase, every page behind sign-in, friends invited as Google test users, the two Supabase packages, and SQL-editor migrations without Docker. Added `@supabase/supabase-js` 2.118 and `@supabase/ssr` 0.12, `.env.example` (and an ignored `.env.local` copy), `src/lib/env.ts`, the Supabase server client, `src/proxy.ts`, `/login`, `/auth/callback`, sign-in and sign-out actions, an account bar on the home page, the `drink_logs` migration, and `/api/places` with `src/lib/places.ts`. Locally, lint is clean, `npm test` passes 10 of 10 (8 new Places parsing tests), and the build succeeds without secrets. With a production build using placeholder Supabase values: `/` answered 307 to `/login`, `/login` answered 200, `/api/places?q=boba` answered 401 with `{"error":"Sign in first."}`, and `/auth/callback` without a code redirected to `/login?error=callback`, which showed "Sign-in didn't finish. Try again." Clicking **Continue with Google** in agent-browser sent the browser to `https://example.supabase.co/auth/v1/authorize?provider=google&redirect_to=http%3A%2F%2Flocalhost%3A3124%2Fauth%2Fcallback` with a PKCE challenge. The real Google round trip and a live Places call wait on the owner's credentials.
- **2026-10-24.** CI passed on `4c1778c`: [run 40163264672](https://github.com/BrianNguyen2323/BobaNote/actions/runs/40163264672). The build needs no secrets.
- **2026-10-24.** Owner reported sign-in redirecting to the Netlify site. Cause: `.env.local` defined `NEXT_PUBLIC_SUPABASE_URL` twice, and the second value (the Netlify URL) won, so the app sent `/auth/v1/authorize` to Netlify. Removed the duplicate line. Sign-in now reaches Supabase, which answers `{"code":400,"error_code":"validation_failed","msg":"Unsupported provider: provider is not enabled"}`. Next step for the owner: README step 3.5, turn on the Google provider in Supabase with the Client ID and Client Secret.
- **2026-10-24.** Google provider is on. Google now answers `Error 400: redirect_uri_mismatch`. Supabase sends `redirect_uri=https://<project-ref>.supabase.co/auth/v1/callback` to Google (read from the browser request). Next step for the owner: add that exact URI under the OAuth client's **Authorized redirect URIs** (README step 3.3), using the same client whose ID is pasted in Supabase.
