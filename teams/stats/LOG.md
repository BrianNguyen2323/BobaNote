# Stats team (phase 4)

Branch: `phase-4/stats`, branched from `main` at `f4f3f7f`. Goal: the `/stats` screen with a week, month, and year picker, a bar chart, and top drinks.

## Status

Code is done. Lint, tests, and build pass locally, and the page was checked live at 390x844. Waiting on CI and review. The owner merges into `main`.

## Done when

- [x] `src/lib/stats.ts` with Vitest tests.
- [x] `/stats` page and `src/components/stats/`.
- [x] Lint, tests, and build pass locally.
- [x] Checked live in light and dark mode with seeded data.
- [ ] CI green on the final commit.

## Provides

All in `src/lib/stats.ts`, pure, working on ISO day strings (`YYYY-MM-DD`) with `Date.UTC` math.

- `type Period = "week" | "month" | "year"`. `WEEK_STARTS_ON = 0` (Sunday) is the single week-start setting.
- `periodRange(period, anchorDay): { start, end }`. Inclusive calendar week, month, or year containing the anchor.
- `shiftAnchor(period, anchorDay, delta): string`. Moves whole periods. Month and year shifts clamp the day (Jan 31 plus one month is Feb 28 or 29).
- `periodLabel(period, start, end): string`. "Oct 18 to 24, 2026", "Oct 28 to Nov 3, 2026", "Dec 27, 2026 to Jan 2, 2027", "October 2026", "2026".
- `bucketCounts(drinks, period, anchorDay): { key, label, count }[]`. Zero-filled: 7 days, every day of the month, or 12 months. `key` is an ISO day, or `YYYY-MM` for a year. `label` is the short axis text ("Sun", "20", "Jan").
- `bucketName(key): string`. Screen reader name such as "Tue Oct 20" or "Oct 2026".
- `topDrinks(drinks, start, end, limit = 5): { name, count }[]`. Groups by `normalizeDrinkName`. Shows the most recent spelling. Ties go to the newest drink, then name.
- UI: `StatsView` (client) takes `drinks: DrinkLog[]`. `BarChart` and `TopDrinks` are small presentational parts.

## Decisions

| Decision | Why |
|---|---|
| Today comes from `useSyncExternalStore` with a `null` server snapshot | The server never renders a date, so there is no prerender clock error and no hydration mismatch. The page shows a blank placeholder for one frame. |
| Anchor is `null` until the user moves, meaning "today" | Midnight rollover and the "forward disabled" check stay correct without extra state. |
| Month view labels only days 1 and every 5th | 31 labels do not fit at 390px. Every bar still has a full aria-label. |
| Zero-count bars draw as a thin stub | Shows the empty days exist. |
| Relative imports | Vitest does not resolve `@/`. |

## Log

- **2026-10-25.** Added `stats.ts` and 16 tests, then the page and components. Locally, lint is clean, `npm test` passes 44 of 44, and the build succeeds.
- **2026-10-25.** Live check on a dev server at port 3202, signed in as the test user with 25 seeded rows (shop "Seed Shop", since deleted). At 390x844, week, month, and year views, the back and forward arrows, the top drinks list, and an empty year all rendered correctly in light and dark mode. Forward is disabled on the current period. The month view in light mode was not captured.
