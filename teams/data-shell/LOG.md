# Data shell team (phase 1)

Branch: `phase-1/data-shell`. Goal: the typed drink data module, the signed-in app shell with a floating glass tab bar, and a hidden debug page.

## Status

Code is done and passes lint, tests, and build. Waiting on CI and on the owner applying the `drink_logs` migration in Supabase. Until then every live call fails with PGRST205 (table not found), and `/debug` shows that message in its "Last error" card. The owner merges into `main` after review.

## Done when

- [x] `src/lib/drinks.ts` with types, row mapping, `parseDrinkInput`, and the five server functions.
- [x] `src/lib/dates.ts` with `toIsoDay` and `isIsoDay`.
- [x] Vitest tests for validation, mapping, and dates.
- [x] Route group `src/app/(app)/` with a layout, the account line, and the tab bar.
- [x] Placeholder `/history` and `/stats` pages.
- [x] Hidden `/debug` page.
- [x] Lint, tests, and build pass locally.
- [ ] CI green.
- [ ] Owner applies the migration and opens `/debug` signed in. Not verified: no live DB call ran.

## Provides

- **Types** (`src/lib/drinks.ts`). `Shop = { name; address: string | null; latitude: number | null; longitude: number | null; placeId: string | null }`. `DrinkLog = { id; drinkName; date; size; sugarPercent; icePercent; toppings: string[]; rating: number | null; shop: Shop; createdAt }`. `DrinkInput = Omit<DrinkLog, "id" | "createdAt">`. `date` is a `YYYY-MM-DD` local day.
- **Parsing.** `parseDrinkInput(value: unknown): { ok: true; value: DrinkInput } | { ok: false; errors: Partial<Record<keyof DrinkInput | "shop", string>> }`. Call it in every Server Action on the raw form data. It trims, requires drinkName, size, and shop name, checks the date is a real day, allows sugar and ice above 100, takes rating null or 1 to 10, and de-duplicates toppings ignoring case. Error values are user-facing sentences.
- **Mapping.** `rowToDrink(row: DrinkRow): DrinkLog` and `drinkToRow(input: DrinkInput)`. The row never has `user_id`.
- **Server functions** (call only on the server, they read cookies). `listDrinks(): Promise<DrinkLog[]>` newest day first, then newest created. `getDrink(id: string): Promise<DrinkLog | null>`. `createDrink(input: DrinkInput): Promise<DrinkLog>`. `updateDrink(id: string, input: DrinkInput): Promise<DrinkLog>`. `deleteDrink(id: string): Promise<void>`. All throw `Error` with Supabase's message. `updateDrink` throws when the id matches no row of the user's.
- **Dates** (`src/lib/dates.ts`). `toIsoDay(date: Date): string` uses local year, month, and day. `isIsoDay(s: string): boolean`. Compute "today" in a client component, never on the server.
- **Route group.** Signed-in pages live in `src/app/(app)/`. Its `layout.tsx` shows the account line ("Signed in as ..." and Sign out, inside `<Suspense>`) and the tab bar, and pads the bottom so content is never covered. `/login` and `/auth/*` stay outside it. The pages are `/` (style preview, phase 2 replaces it), `/history` and `/stats` (placeholders with only a heading, phases 3 and 4 replace them), and `/debug`.
- **`TabBar`** (`src/components/TabBar.tsx`, client). Fixed floating glass bar with Log `/`, History `/history`, Stats `/stats`. Active tab comes from `usePathname` and gets `aria-current="page"`. A new tab means adding one entry to the `TABS` array. Pages inside the group need no extra bottom padding.
- **CSS.** `viewportFit: "cover"` in the root viewport, plus the `tab-bar-position` and `pb-tab-bar` utilities in `globals.css`, both using `env(safe-area-inset-bottom)`.

## Decisions

| Decision | Why |
|---|---|
| `src/lib/supabase/server.ts` now imports `../env` instead of `@/lib/env` | `drinks.ts` imports it, and Vitest does not resolve `@/`. |
| `drinks.ts` is about 175 lines | Types, parsing, and the five queries are one module, and splitting would hide the single boundary. Split only if it grows. |
| `listDrinks` has no limit | Personal use. Add paging if a user reaches thousands of rows. |
| Tab is active by path prefix, `/` only on an exact match | Otherwise Log would light up on every page. |
| Account line moved to the layout | One place for all signed-in pages. The home page lost its own copy. |
| Rating that is `undefined` counts as skipped | Forms that omit the field mean "no rating". |

## Log

- **2026-10-24.** Added the data module, date helpers, and tests (`c9b06a4`). Then the route group and tab bar (`74453f9`), then the debug page (`54862a5`). Locally, lint is clean, `npm test` passes 26 of 26, and the build succeeds.
- **2026-10-24.** Browser check at 390x844 in light and dark mode. Signed-out `/`, `/history`, and `/debug` answer 307 to `/login`, and `/login` renders without a tab bar. **Not verified:** the tab bar, account line, and debug page, because they need a signed-in session and I did not fake one. The phase needs an owner-side check after the migration is applied.
