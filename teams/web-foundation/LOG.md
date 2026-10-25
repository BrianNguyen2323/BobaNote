# Web foundation team (phase 0)

Branch: `phase-0/web-foundation`. Goal: replace the iOS project with a Next.js + Tailwind app that has the taro theme, the first liquid glass components, one tested logic module, and CI.

## Status

CI is green. Waiting on the owner to review the style preview with `npm run dev` and merge into `main`. Phase 1 (persistence) starts after the merge.

## Done when

- [x] iOS files removed (`project.yml`, `BobaNote/`, `BobaNoteCore/`, the Xcode CI workflow, `teams/build-loop/`).
- [x] Next.js 16 app with Tailwind v4 at the repo root.
- [x] Taro theme tokens for light and dark mode in `src/app/globals.css`.
- [x] `glass` utility, `GlassCard`, and `ChipGroup`.
- [x] `normalizeDrinkName` with Vitest tests.
- [x] `npm run lint`, `npm test`, and `npm run build` pass locally.
- [x] Page checked in a browser at 390x844, in light and dark mode.
- [x] CI green on this branch.
- [ ] Owner approves the look and merges into `main`.

## Provides

- **Theme tokens.** Defined in `src/app/globals.css` and used as Tailwind classes. Colors are `surface`, `ink`, `ink-muted`, `accent` (fills such as a selected chip), `accent-ink` (accent-colored text, lighter in dark mode), and `on-accent` (text on an accent fill). The radius is `rounded-glass`. Add a token in `globals.css` instead of using arbitrary values.
- **`glass` utility.** Translucent fill, blur and saturation, a bright top edge, and a soft shadow. Falls back to a solid fill under Reduce Transparency.
- **`GlassCard`** (`src/components/GlassCard.tsx`). A glass panel with padding. Takes `className` for layout.
- **`ChipGroup`** (`src/components/ChipGroup.tsx`). Single-choice chips built on native radio inputs. Props are `label`, `name`, `options` (`{ value, label }[]`), `value` (or `null` for nothing picked), and `onChange`. It is a client component.
- **Presets** (`src/lib/presets.ts`). `PERCENT_PRESETS`, `SIZE_PRESETS`, `TOPPING_PRESETS`, `RATING_MIN`, and `RATING_MAX`.
- **`normalizeDrinkName`** (`src/lib/drinkName.ts`). Trims, collapses inner whitespace, and lowercases.
- **Tests.** Vitest. Put `*.test.ts` next to the module. `npm test` runs them all once.
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

## Log

- **2026-10-24.** Owner switched the project from iOS to a Next.js web app. Branched `phase-0/web-foundation` from `main` (`9bc4b3d`). Removed the iOS files and the `latest` iOS build process. Rewrote `CLAUDE.md`, `README.md`, and `teams/README.md` for the web stack. Added the scaffold, theme, `GlassCard`, `ChipGroup`, presets, `normalizeDrinkName` with two tests, and a Node CI workflow (lint, test, build). Locally, `npm run lint` reported no issues, `npm test` passed 2 of 2, and `npm run build` succeeded. In agent-browser at 390x844, light and dark mode both render. Tapping the ice "25%" chip changed the summary to "M, 50% sugar, 25% ice". The dark-mode screenshot showed the "Style preview" label unreadable, so `accent-ink` was added and the label rechecked.
- **Not done.** The GitHub `latest` release with the old `BobaNote.ipa`, and the remote branches `docs/claude-md-plan` and `phase-0/build-loop`, still exist. Deleting them is the owner's call.
- **2026-10-24.** CI passed on `c96d5d0`: [run 40161879031](https://github.com/BrianNguyen2323/BobaNote/actions/runs/40161879031). The `check` job ran lint, tests, and build on Ubuntu with Node from `.nvmrc`.
