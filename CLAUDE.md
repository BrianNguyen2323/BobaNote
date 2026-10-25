# CLAUDE.md — Boba Note

Guidance for Claude Code working on this repo. Read fully before making changes. The owner (Brian) is a CS grad student. Explain framework-specific concepts (Next.js, React, Tailwind) briefly the first time they come up, prefer boring standard solutions, and flag anything that creates technical debt.

Boba Note started as an iOS app. In October 2026 the owner switched it to a Next.js web app. The iOS work (XcodeGen, SwiftUI, SideStore) is gone from the tree. It survives only in git history up to commit `9bc4b3d`.

## Product

A web app for logging boba drinks and seeing habits over time: how many drinks per week/month/year, top drinks by frequency, and a full history list. It must work well on a phone browser first, then on desktop.

**Audience for v1:** personal use and friends. Users sign in with Google, and the owner invites each friend by adding them as a test user in Google Cloud. Development is local for now. Deployment to Netlify comes later. Don't build for scale, monetization, or SEO.

## MVP scope (build in this order)

0. **Foundation.** Next.js + Tailwind scaffold, the taro theme, the first liquid glass components, Google sign-in through Supabase, the `drink_logs` table with row level security, the server-side Google Places search, and CI. Done when the owner signs in with Google locally, sees the style preview page, and CI is green.
1. **Drink data module.** Typed functions in `src/lib/` that create, read, update, and delete the signed-in user's drinks in Supabase, plus a hidden debug page that shows the row count and the last error.
2. **Log a drink** flow, styled like typical boba ordering apps (card-based, tappable choices, minimal typing). In this phase the shop is a free-text name. Phase 5 adds search results to the same field.
3. **History list** of all drinks, newest first, with delete, edit (reuses the log form), and **log again** (prefills the log form from a past entry with today's date). Filters are post-MVP.
4. **Stats** page.
   - A Week / Month / Year picker with back and forward arrows. Periods are calendar periods (this week, October, 2026), not rolling windows.
   - Bars per day for week and month. Bars per month for year.
   - Top drinks are ranked within the selected period, grouped by normalized drink name only. The same drink name at two shops counts as one drink.
5. **Nearby shops** in the log form, using the existing `/api/places` route (Google Places Text Search). Ask for the browser's location only when the user taps "Nearby".

**Cut first if time is short:** the yearly anniversary recap. It is explicitly post-MVP. Do not build it, but keep data queryable by year so it is easy to add.

## Logging flow

- Shop comes from either:
  - the **nearby list** (search for boba/bubble tea near the browser's location, sorted by distance), or
  - **manual search by name/location** ("make new entry" for logging later, like Yelp/Apple Maps search), or free-text name as a last resort.
- Drink fields (v1): shop, drink name, date, size, sugar %, ice level, toppings, rating.
- **Drink name:** manual text entry with **autosuggest from the user's past entries** (case-insensitive match as they type), so repeat drinks stay consistent and "top drinks" counts don't split on typos or casing.
- **Size:** preset chips (S / M / L) plus a custom text option, same pattern as sugar/ice and toppings.
- **Sugar and ice:** preset chips at 0 / 25 / 50 / 75 / 100% plus a custom numeric input.
- **Toppings:** list of common presets (e.g. tapioca pearls, pudding, grass jelly, lychee jelly, popping boba, cheese foam) plus custom input. Multiple per drink.
- **Rating:** optional. The user can skip it. When given, it is an integer from 1 to 10, picked from 10 chips.
- **Date:** date only, no time of day. Defaults to today. Allow a past date (the "log later" case).
- All presets and the rating range live in `src/lib/presets.ts`.

## Tech stack

- **Framework:** Next.js 16 (App Router) with TypeScript and React 19. This Next.js version differs from older training data. Read `AGENTS.md` and the matching guide in `node_modules/next/dist/docs/` before using a Next.js API.
- **Styling:** Tailwind CSS v4. The theme lives in `src/app/globals.css` (`@theme` tokens and the `glass` utility). There is no `tailwind.config.js` in v4.
- **Auth:** Supabase Auth with the Google provider. No other auth library. Sign-in and sign-out are Server Actions in `src/app/auth/actions.ts`. `/auth/callback` finishes the sign-in. `src/proxy.ts` refreshes the session on every request and sends signed-out visitors to `/login`. Next.js 16 renamed `middleware.ts` to `proxy.ts`.
- **Database:** Supabase Postgres, table `drink_logs`. Schema changes are SQL files in `supabase/migrations/`, named `<timestamp>_<name>.sql`. The owner applies each one by pasting it into the Supabase SQL editor. No Supabase CLI, no Docker.
- **Shop search:** Google Places API (New) Text Search, called only from the server in `src/lib/places.ts` through the `/api/places` route.
- **Supabase packages:** `@supabase/supabase-js` and `@supabase/ssr`, using the `getAll` and `setAll` cookie pattern.
- **Environment variables:** listed with instructions in `.env.example`. Real values go in `.env.local`, which git ignores. `src/lib/env.ts` reads them and throws a clear error when one is missing.
- **Charts:** plain Tailwind bars first (a bar is a `div` with a height). Add a chart library only if the stats page needs axes or interaction that divs can't do, and ask first.
- **Tests:** Vitest (`npm test`). Test files sit next to the code as `*.test.ts`.
- **Node:** version 22, pinned in `.nvmrc`. CI and Netlify both read it.
- **No other dependencies in v1** unless clearly justified. Ask before adding any package.
- **Architecture:** pages and components contain layout only. Logic lives in TypeScript modules in `src/lib/`. Keep pure logic (parsing, stats, date math) in functions that take plain values, so Vitest can test them without Next.js or a network. Inside `src/lib/`, import sibling modules with relative paths (`./env`), because Vitest does not resolve the `@/` alias.

## Data model

One table, `drink_logs`, defined in `supabase/migrations/20261024000000_create_drink_logs.sql`. There is no topping or shop table. The phase 1 data module maps each row to a camelCase `DrinkLog` type in one place.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Generated by the database. |
| `user_id` | `uuid` | Defaults to the signed-in user (`auth.uid()`). Deleting the user deletes their rows. |
| `drink_name` | `text` | As typed. Normalize only when grouping. |
| `date` | `date` | Local calendar day. Supabase returns it as a `YYYY-MM-DD` string. |
| `size` | `text` | `"S"`, `"M"`, `"L"`, or custom text. |
| `sugar_percent` | `smallint` | 0 or more. |
| `ice_percent` | `smallint` | 0 or more. |
| `toppings` | `text[]` | Preset or custom names. |
| `rating` | `smallint`, nullable | 1 to 10, or `null` when skipped. |
| `shop_name` | `text` | |
| `shop_address` | `text`, nullable | |
| `shop_latitude` | `double precision`, nullable | |
| `shop_longitude` | `double precision`, nullable | |
| `shop_place_id` | `text`, nullable | Google Places ID when the shop came from search. |
| `created_at` | `timestamptz` | Set by the database. |

**Row level security** is on. Policies let a signed-in user select, insert, update, and delete only rows where `user_id` is their own ID. The database enforces this even if app code has a bug, so never turn RLS off or put the Supabase secret key in the app.

Design rules to avoid debt:
- **Snapshot the shop on each `DrinkLog`** so history survives if a shop closes or the search provider's data changes. A "recent shops" list is derived from past logs, the same way drink-name autosuggest is.
- **Preset lists are UI constants.** A value is custom when it is not in the preset list, so the record does not store an `isCustom` flag.
- **Store sugar/ice as integer percent**, not enums, so custom values work. Presets are just UI.
- **Never store computed stats.** Counts and top-drink rankings are derived from `DrinkLog` records.
- **Normalize drink names** with `normalizeDrinkName` in `src/lib/drinkName.ts` (trim, collapse inner whitespace, lowercase) when computing "top drinks".
- **Dates are days, not instants.** Send and receive `date` as a `YYYY-MM-DD` string built from the user's local date. Never pass a JavaScript `Date` or a UTC timestamp, because converting one back to a day can shift it across midnight. Week, month, and year boundaries are computed from these strings in `src/lib/`, with tests.
- **Parse external data at the boundary.** Query parameters, form input, and Google Places responses are untrusted. Parse them once where they enter (see `parseShopSearch` and `parsePlacesResponse` in `src/lib/places.ts`) and pass typed values inward.
- Schema changes: every change is a new SQL file in `supabase/migrations/`. Never edit a file that has already been applied. Ask before changing the schema.

## Technical debt rules (the important part)

1. **One module owns drink data.** Phase 1 adds it in `src/lib/`. Pages and components call it and never query Supabase directly. Don't add an interface or adapter until a second backend actually exists.
2. **Auth stays in its own files:** `src/proxy.ts`, `src/lib/auth.ts` (`getCurrentUser`), and `src/app/auth/`. The proxy redirect is a convenience, not security. Every Server Action and Route Handler checks the user again, and RLS is the final guard.
3. **No arbitrary values in components.** Colors, radii, and fonts come from the theme tokens in `globals.css`, used through Tailwind classes (`bg-accent`, `text-ink-muted`, `rounded-glass`). No `bg-[#...]` or `p-[13px]`. Add a token when a value is missing. English text in components is fine. v1 is not localized.
4. **No giant components.** Split once a file passes roughly 150 lines.
5. **Handle location permission states** (prompt, denied, unavailable) with real fallbacks. Manual shop search must always work without location.
6. **Don't scrape boba shop websites/apps.** The future "import real menus" idea is post-MVP and legally/technically brittle.
7. **Write unit tests for the stats logic** (counts, date boundaries, top-N ranking). That's the part most likely to have subtle bugs.
8. **Small commits, one feature per branch,** and keep `main` always buildable.
9. **Secrets stay on the server.** Only variables prefixed `NEXT_PUBLIC_` reach the browser, and those must be safe to publish (the Supabase URL and publishable key). `GOOGLE_PLACES_API_KEY` must never get that prefix.
10. **Reading the session needs a `<Suspense>` boundary.** Cache Components is on, so a component that calls `getCurrentUser()` or reads `cookies()` or `searchParams` must sit inside `<Suspense>`. Otherwise the build fails. See `node_modules/next/dist/docs/01-app/02-guides/authentication-with-cache-components.md`.
11. **Places calls cost money.** Keep the field mask in `src/lib/places.ts` to id, name, address, and location. Asking for ratings, photos, or hours moves every call to a more expensive tier. Never call Places on every keystroke. Search when the user submits.

## Post-MVP backlog (do NOT build yet)

- Yearly anniversary recap
- History filters (by shop, date range, rating, topping)
- Price per drink, then spending stats (store price as integer cents, optional)
- Nutrition info (calories/sugar), likely requiring structured menu data
- Shop menu integration so users tap a menu item and adjust sugar/ice/toppings
- JSON export of a user's drinks
- Installable PWA (home screen icon, offline support)
- Share cards, CSV export

## Dev environment

The owner develops on Windows with VS Code. Everything runs locally.

- `npm install` once, then `npm run dev` and open `http://localhost:3000`.
- To test on a phone, run `npm run dev -- -H 0.0.0.0` and open `http://<PC's LAN IP>:3000` on a phone on the same Wi-Fi. Windows Firewall may ask to allow Node.
- Before pushing, run `npm run lint`, `npm test`, and `npm run build`. CI runs the same three on every push.
- On a CI failure, read the logs with the GitHub CLI (`gh run list`, `gh run view <id> --log-failed`), fix, and push again. Do not declare a task done until CI is green. `gh` is installed at `~/bin/gh.exe` and needs `gh auth login` once.
- Secrets never go in the repo. Copy `.env.example` to `.env.local` and fill it in. The README section "Connect the services" walks through every value. CI builds without any secrets.

### Deploying later (Netlify)

Not set up yet. Netlify builds Next.js apps with its own adapter and reads the Node version from `.nvmrc`. Cache Components (enabled in `next.config.ts`) needs the Node.js runtime, which Netlify provides. Verify Netlify's current Next.js 16 support before the first deploy. On deploy, add the three `.env.local` variables in Netlify's site settings, add the Netlify URL plus `/auth/callback` to Supabase's redirect URLs, and add the Netlify origin to the Google OAuth client's authorized JavaScript origins.

## Working style with Claude Code

- Before large changes, propose a short plan and wait for approval.
- Prefer the simplest approach that works; call out anything that will be painful to change later.
- Run lint, tests, and build locally, then push and check CI before declaring a task done. Report the actual result, not a guess.
- Verify UI changes in a real browser, at a phone-sized viewport and in both light and dark mode, before declaring them done.
- Make small, frequent pushes so a CI failure points at a small change.
- Ask when a requirement is ambiguous instead of guessing, especially schema decisions.
- Each phase team keeps a running log in `teams/<team>/LOG.md`. Read `teams/README.md` and your team's log before starting work, and update the log with every commit and CI result.

## Pace

Owner can dedicate 10+ hours/week, so the full MVP (minus the yearly recap) is realistic in roughly a month or two. Still build in the order listed above and keep each step shippable.

## Visual style

Reference vibe: modern boba ordering apps such as 7 Leaves, Hey Tea, Auntea Jenny, Molly Tea, and Chagee, rendered in Apple's Liquid Glass style. Take the general feel only: clean, card-based, soft rounded corners, generous whitespace, and large tappable chips for size, sugar, ice, and toppings so logging takes a few taps. **Do not copy any brand's logos, names, fonts, illustrations, or assets.** Boba Note needs its own identity.

- **Palette:** taro purple accent (`--accent`, `#6f4fa0`) with white and pale lavender surfaces. Dark mode follows the system setting and has its own values for every token. The accent passes WCAG AA contrast with white text.
- **Liquid glass:** translucent panels with background blur and saturation, a bright top edge, and a soft shadow, over soft taro gradient blobs on the page background. Use the `glass` utility, or `GlassCard` for panels. Apple's lens refraction is out of scope, because Safari can't apply SVG filters in `backdrop-filter`. When the user turns on Reduce Transparency, glass falls back to a solid fill.
- **Components:** `GlassCard` and `ChipGroup` (single choice, built on native radio inputs so keyboard and screen readers work) exist. Build the rest as reusable components too (multi-select chips for toppings, rating chips, drink card, floating glass tab bar) so the app stays visually consistent.
- **Accessibility:** touch targets at least 44px tall, visible focus rings, text sized in `rem` so browser zoom works, and system fonts (SF Pro on Apple devices).
- **Icons:** inline SVG until custom artwork exists. Ask before adding an icon package.

## Decided

- App name: **Boba Note**
- Platform: Next.js web app, local development now, Netlify later
- Sign-in: Google through Supabase Auth. Every page requires sign-in. Friends are invited as Google Cloud test users.
- Storage: Supabase Postgres with row level security. Migrations applied in the SQL editor.
- Shop search: Google Places API (New) Text Search, server-side only
- Palette: taro purple accent, white surfaces, liquid glass panels
- Stats use calendar periods. Top drinks are ranked within the selected period and grouped by drink name only.
- Rating is optional, 1 to 10. Drink date is a day, not a time.

## Open questions

- Free Supabase projects may pause after about a week with no activity (unverified). Data is kept, but the owner must restore the project in the dashboard. Revisit before friends rely on the app.
- App icon. `src/app/icon.svg` is a placeholder.
