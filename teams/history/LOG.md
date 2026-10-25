# History team (phase 3)

Branch: `phase-3/history`, branched from `main` at `e3a04fa`. Goal: the `/history` list with edit, log again, and delete.

## Status

Code is done. Lint, tests, and build pass locally, and the page was checked live at 390x844. Waiting on CI and review. The owner merges into `main`.

## Done when

- [x] `deleteDrinkAction`.
- [x] `DrinkCard`.
- [x] `/history` with day grouping, Edit, Log again, and two-step Delete.
- [x] Checked live in light and dark mode.
- [ ] CI green on the final commit.

## Provides

- `deleteDrinkAction(id: string): Promise<{ ok: true } | { ok: false; message: string }>` in `src/app/(app)/drinks/actions.ts`. Checks the user, deletes, revalidates `/history`.
- `DrinkCard` (`src/components/DrinkCard.tsx`, server-safe). Props: `drink: DrinkLog`, optional `actions: ReactNode` rendered under the details. Rating shows only when not null.
- `DrinkActions` (`src/components/DrinkActions.tsx`, client). Edit, Log again, and a Confirm/Cancel delete for one drink id.
- `groupByDay(drinks)` and `formatDayHeading(day)` in `src/lib/historyGroups.ts`, pure and tested.

## Decisions

| Decision | Why |
|---|---|
| `groupByDay` merges only adjacent drinks | `listDrinks()` is already sorted by day, so one pass is enough. |
| The card disappears through `revalidatePath("/history")` | No local state to keep in sync. A failed delete shows the message and closes the confirm. |
| Delete confirm uses the accent button | The Delete button itself is red. Confirm is the same size as the other actions. |

## Log

- **2026-10-25.** Added `deleteDrinkAction`, `DrinkCard`, and the history page with 5 new tests. Lint is clean, tests pass, and the build succeeds.
- **2026-10-25.** Live check at 390x844, light and dark, on port 3203 with 4 drinks (shops "E2E History ...", all deleted afterwards). Grouping and order, cards with and without rating, Edit and save back to `/history`, Log again prefill, Delete then Cancel, Delete then Confirm (gone after reload), and the empty state all worked. Not seen: a failed delete message.
