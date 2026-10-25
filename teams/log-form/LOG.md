# Log form team (phase 2)

Branch: `phase-2/log-form`. Goal: the real Log a drink flow at `/`, plus edit and "log again".

## Status

Code is done and passes lint, tests, and build. Verified live at 390x844 in light and dark mode (see Log). Waiting on CI and owner review. Not verified: the browser's real location permission prompt (the test browser answers "denied"), and a first-click tap landing on the floating tab bar (see Decisions).

## Done when

- [x] `createDrinkAction` and `updateDrinkAction`.
- [x] Form components in `src/components/log/`, assembled in `DrinkForm`.
- [x] `/` is the log form, with `?from=<id>` prefill. `StylePreview.tsx` is deleted.
- [x] `/drinks/[id]/edit`.
- [x] Pure helpers with Vitest tests.
- [x] Lint, tests, and build pass locally.
- [x] Browser check, light and dark.
- [ ] CI green.

## Provides

- **`DrinkForm`** (`src/components/log/DrinkForm.tsx`, client). Props: `mode: "create" | "edit"`, `drinkId?: string` (edit only), `initial?: DrinkInput`, `suggestions: string[]`, `recentShops: Shop[]`. In create mode the date always starts as today, even when `initial` has another date.
- **Actions** (`src/app/(app)/drinks/actions.ts`). `createDrinkAction(input: unknown): Promise<SaveResult>` and `updateDrinkAction(id, input): Promise<SaveResult>`. `SaveResult = { ok: true } | { ok: false; errors: DrinkErrors; message?: string }`. Update redirects to `/history` on success. A Supabase failure returns `message` and does not throw. Create calls `revalidatePath("/")` so suggestions and recent shops refresh.
- **URLs.** `/` is the log form. `/?from=<drink id>` prefills it from that drink (the date becomes today). `/drinks/<id>/edit` edits a drink. A missing or malformed id shows a "doesn't exist" message.
- **Pure helpers** (`src/lib/drinkHistory.ts`, tested). `pastDrinkNames(drinks)`, `recentShops(drinks, limit = 5)`, and `matchNames(names, typed, limit = 5)`. All expect `drinks` newest first, as `listDrinks()` returns.
- **Form mapping** (`src/lib/drinkForm.ts`, tested). `FormState`, `emptyForm`, `fromDrink`, and `toActionInput`. A blank sugar or ice field becomes `null`, so it fails validation instead of saving 0%.
- **Components** (`src/components/log/`). `PresetOrCustom` (chips plus an "Other" input, built on `ChipGroup`), `ToppingPicker`, `ShopPicker` with `useShopSearch`, `DrinkNameField`, and `Field` helpers (`inputClass`, `pillButtonClass`, `accentButtonClass`, `FieldError`).
- **Theme.** New `danger` color token (error text), added at the end of `globals.css`.
- **Layout.** `TabBar` is now wrapped in `<Suspense>` in `src/app/(app)/layout.tsx`. A dynamic route such as `/drinks/[id]/edit` fails the build otherwise, because `usePathname` needs a boundary.

## Decisions

| Decision | Why |
|---|---|
| `ChipGroup` is unchanged | "Other" is an option with a sentinel value, and the custom input is rendered by `PresetOrCustom`. Phase 4 keeps working. |
| Size, sugar, and ice have no default | A silent default logs wrong data. Empty submit shows field errors. |
| Date is read with `useSyncExternalStore` | The server can't know the user's local day, and setting state in an effect fails the React lint rule. An empty form date means "today". |
| Suggestion list is a plain `<ul>` with a solid fill, not `<datalist>` | iOS Safari handles `<datalist>` poorly. A glass fill let the label underneath show through. |
| Shop search runs on Search or Enter only | CLAUDE.md rule 11. Enter is intercepted so it does not submit the whole form. |
| Free-text shop is `{ name, others null }` | Matches `Shop` and the phase 5 spec. |
| `getDrink(...).catch(() => null)` on both pages | A malformed id makes Postgres throw. The user should see "doesn't exist", not a crash. |
| Tab bar can cover the Log button | A fixed bar sits over content mid-scroll. It never covers the button at the end of the page (`pb-tab-bar`). A test browser that scrolls an element to the bottom edge hit it. Real taps are unaffected. |

## Log

- **2026-10-25.** Units committed separately: actions, helpers with tests, components, pages. Local: lint clean, 33 of 33 tests, build succeeds.
- **2026-10-25.** Live check on port 3201 as the E2E test user, 390x844. Empty submit showed "Enter a shop name.", "Enter a drink name.", "Pick a size." and the sugar and ice errors. Logged a drink with shop "E2E Shop" (free text after a Places name search), custom size XL, custom sugar 120, ice 50, toppings Tapioca pearls and a custom "E2E Salted caramel", rating 8. The row in Supabase matched. `/?from=<id>` prefilled everything, and logging again made a second row. `/drinks/<id>/edit` changed the rating from 8 to 9 and redirected to `/history`. A malformed id showed the not-found message. Name search ("Boba Guys San Francisco") and Enter-to-search returned results. Nearby with a stubbed location sent `lat` and `lng` to `/api/places` and listed shops. With the real permission denied, the visible message was "Location is blocked for this site...". Drink-name suggestions listed "E2E Taro Tea" for "e2e t". Deleted both E2E rows afterward.
