# CLAUDE.md — Boba Note

Guidance for Claude Code working on this repo. Read fully before making changes. The owner (Brian) is a CS grad student who is **new to iOS/Swift**: explain Apple-specific concepts briefly when introducing them, prefer boring standard solutions, and flag anything that creates technical debt.

## Product

An iOS app for logging boba drinks and seeing habits over time: how many drinks per week/month/year, top drinks by frequency, and a full history list.

**Audience for v1:** personal use and friends (sideload/TestFlight). Not an App Store launch yet, so don't build for App Store review, monetization, or scale.

## MVP scope (build in this order)

0. **Build loop.** Before any feature, land a branch with `project.yml`, a one-screen app, the `BobaNoteCore` package with one passing test, and a GitHub Actions workflow that builds, tests, and uploads an unsigned `.ipa`. The phase is done when the owner installs that `.ipa` on the iOS 18.7.8 iPhone through SideStore.
1. **Local persistence** in a JSON file, plus the hidden debug screen and a **JSON export** through the share sheet. No accounts, no backend, no login in v1. Export is in the MVP because it is the only backup. Deleting the app, or reinstalling it under a different Apple ID, loses all data.
2. **Log a drink** flow, styled like typical boba ordering apps (card-based, tappable choices, minimal typing). In this phase the shop is a free-text name. Phase 5 adds MapKit results to the same field.
3. **History list** of all drinks, newest first, with swipe-to-delete, edit (reuses the log form), and **log again** (prefills the log form from a past entry with today's date). Filters are post-MVP.
4. **Stats** screen. Use Swift Charts.
   - A Week / Month / Year picker with back and forward arrows. Periods are calendar periods (this week, October, 2026), not rolling windows.
   - Bars per day for week and month. Bars per month for year.
   - Top drinks are ranked within the selected period, grouped by normalized drink name only. The same drink name at two shops counts as one drink.
5. **Nearby shops** via Apple MapKit, used when picking a shop while logging.

**Cut first if time is short:** the yearly anniversary recap (needs local notifications + a designed recap screen). It is explicitly post-MVP. Do not build it, but keep data queryable by year so it is easy to add.

## Logging flow

- Shop comes from either:
  - the **nearby list** (MapKit local search for boba/bubble tea, sorted by distance), or
  - **manual search by name/location** ("make new entry" for logging later, like Yelp/Apple Maps search), or free-text name as a last resort.
- Drink fields (v1): shop, drink name, date, size, sugar %, ice level, toppings, rating.
- **Drink name:** manual text entry with **autosuggest from the user's past entries** (case-insensitive match as they type), so repeat drinks stay consistent and "top drinks" counts don't split on typos or casing.
- **Size:** preset chips (S / M / L) plus a custom text option, same pattern as sugar/ice and toppings.
- **Sugar and ice:** preset chips at 0 / 25 / 50 / 75 / 100% plus a custom numeric input.
- **Toppings:** list of common presets (e.g. tapioca pearls, pudding, grass jelly, lychee jelly, popping boba, cheese foam) plus custom input. Multiple per drink.
- **Rating:** optional. The user can skip it. When given, it is an Int from 1 to 10, picked from 10 chips. Define the range once in a shared constant.
- **Date:** date only, no time of day. Defaults to today. Allow a past date (the "log later" case).

## Tech stack

- **Language/UI:** Swift, SwiftUI
- **Persistence:** one JSON file in the app's Documents directory, encoded and decoded with `Codable`. No SwiftData in v1. The app loads the whole file at launch and rewrites it after every change, using an atomic write (`Data.write(to:options: .atomic)`) so a crash mid-save never leaves a half-written file. A missing file means an empty history. A file that fails to decode must not be overwritten. Show the error on the debug screen instead, so no data is lost. Revisit SwiftData only if the app needs CloudKit sync or the history grows far past a few thousand drinks.
- **Minimum iOS:** 18. Verify the current Xcode version on the GitHub macOS runner before starting.
- **Charts:** Swift Charts
- **Location/shops:** CoreLocation (When-In-Use permission only) + MapKit (`MKLocalSearch`). Free, no API key.
- **No third-party dependencies in v1** unless clearly justified. Ask before adding any package.
- **Architecture:** MVVM-lite. Views contain layout only. Logic lives in view models or small service types.

## Data model

One record type, `DrinkLog`. There is no `Topping` entity and no `Shop` entity.

| Field | Type | Notes |
|---|---|---|
| `id` | `UUID` | |
| `drinkName` | `String` | As typed. Normalize only when grouping. |
| `date` | `Date` | Start of the chosen day in the user's calendar. |
| `size` | `String` | `"S"`, `"M"`, `"L"`, or custom text. |
| `sugarPercent` | `Int` | |
| `icePercent` | `Int` | |
| `toppings` | `[String]` | Preset or custom names. |
| `rating` | `Int?` | 1 to 10, or `nil` when skipped. |
| `shopName` | `String` | |
| `shopAddress` | `String?` | |
| `shopLatitude` | `Double?` | |
| `shopLongitude` | `Double?` | |
| `shopMapItemID` | `String?` | Apple Maps identifier, when the shop came from MapKit. |

Design rules to avoid debt:
- **Snapshot the shop on each `DrinkLog`** so history survives if a shop closes or MapKit data changes. A "recent shops" list is derived from past logs, the same way drink-name autosuggest is.
- **Preset lists are UI constants.** Toppings, sizes, and sugar and ice presets live in one constants file. A value is custom when it is not in the preset list, so the record does not store an `isCustom` flag.
- **Store sugar/ice as Int percent**, not enums, so custom values work. Presets are just UI.
- **Never store computed stats.** Weekly/monthly/yearly counts and top-drink rankings are derived from `DrinkLog` records.
- **Normalize drink names** (trim, collapse inner whitespace, case-insensitive grouping) when computing "top drinks", otherwise "Brown Sugar Milk Tea" and "brown sugar milk tea" split the count.
- **Dates are days.** Store `Calendar.current.startOfDay(for:)` of the chosen day, format only in the UI, and use `Calendar` for week/month/year boundaries (don't do date math by hand). Known limit: if the user changes time zones, an old entry can display one day off. That is acceptable for v1.
- Schema changes: adding a new *optional* field is safe, because `Codable` decodes a missing key as `nil`. Renaming or removing fields needs an explicit migration plan. Ask before changing the schema.

## Technical debt rules (the important part)

1. **One store type owns persistence.** A concrete `DrinkStore` class (marked `@Observable` so SwiftUI views refresh when it changes) does all reads and writes. Views and view models never read or write the JSON file directly. Don't add a protocol until a second implementation, such as sync, actually exists. Extracting one from `DrinkStore` then is a small refactor.
2. **No accounts yet.** If sync is added later, it goes behind `DrinkStore`. Don't leak auth into the UI layer.
3. **No hardcoded colors, spacing, or corner radii in views.** Use a small theme file from the start. English text literals in views are fine. v1 is not localized.
4. **No giant views.** Split once a view passes roughly 150 lines.
5. **Handle location permission states** (not determined, denied, restricted) with real fallbacks. Manual shop search must always work without location.
6. **Don't scrape boba shop websites/apps.** The future "import real menus" idea is post-MVP and legally/technically brittle. Design a `MenuProvider` protocol later; don't build it now.
7. **Write unit tests for the stats logic** (counts, date boundaries, top-N ranking). That's the part most likely to have subtle bugs.
8. **Small commits, one feature per branch,** and keep `main` always buildable.

## Post-MVP backlog (do NOT build yet)

- Yearly anniversary recap (local notification + recap screen)
- History filters (by shop, date range, rating, topping)
- Price per drink, then spending stats (store price as integer cents, optional)
- Nutrition info (calories/sugar), likely requiring structured menu data
- Shop menu integration so users tap a menu item and adjust sugar/ice/toppings
- Accounts + cloud sync (Supabase vs CloudKit; decide when needed)
- Widgets, share cards
- CSV export, and importing a JSON export back into the app

## Dev environment

**Constraint: the owner develops on Windows with VS Code and has NO usable Mac (the old MacBook is ruled out until the owner says otherwise).** Windows cannot build, run, or sign iOS apps and there is no Xcode, simulator, debugger, or SwiftUI preview locally. The workflow is therefore: write code locally, push to GitHub, let a macOS CI runner build and test, install the result on a real iPhone with SideStore.

### Build and test loop

1. Claude Code edits Swift files on Windows and commits to a branch, then pushes.
2. **GitHub Actions** (macOS runner, current Xcode) builds the app and runs tests. The repo is **public**, so macOS runner minutes are free. Do not store any secrets, Apple ID credentials, or certificates in the repo or in Actions.
3. On failure, Claude Code reads the logs itself with the GitHub CLI (`gh run list`, `gh run view <id> --log-failed`), fixes the errors, and pushes again. Do not declare a task done until CI is green.
4. On success, CI produces an **unsigned `.ipa`** (build with code signing disabled, then zip `Payload/BobaNote.app` into an `.ipa`) and attaches it to a GitHub Release or workflow artifact.
5. The owner downloads the `.ipa` on their iPhone and installs it with **SideStore**, which re-signs it with their free Apple ID.

### Project generation (no Xcode on Windows)

- Do not hand-edit an `.xcodeproj`/`project.pbxproj`. Commit a **`project.yml` for XcodeGen** and have CI run `xcodegen generate` before building. The bundle identifier, iOS 18 deployment target, and Info.plist keys (including `NSLocationWhenInUseUsageDescription`) live in `project.yml`. Verify the current XcodeGen syntax before writing it.
- The bundle identifier is `com.briannguyen.bobanote`. A bundle identifier is the app's permanent ID on the device. iOS keeps an app's data under it, so changing it later installs a separate, empty app.

### Keep logic testable without Apple frameworks

- Put pure logic in a **local Swift package** (e.g. `BobaNoteCore`) that imports only Foundation: plain `struct` models, date-range helpers, stats (weekly/monthly/yearly counts, top-N drinks, name normalization), and autosuggest matching. It must not import SwiftUI, SwiftData, MapKit, or CoreLocation.
- The `Codable` `DrinkLog` struct and the JSON file read and write code live in `BobaNoteCore`, so their tests run on Windows too. The app's `DrinkStore` only holds the loaded list for SwiftUI and calls into the package to save.
- Unit tests for this package should run both in CI and, if a Swift toolchain is installed on Windows, locally with `swift test`.
- Everything that touches SwiftUI/MapKit can only be verified by CI and on-device, so keep views small, add `#Preview` blocks anyway for later, and prefer simple, conventional APIs over clever ones.

### Testing on a real device

- Free Apple ID signing: apps expire after 7 days, with a max of 3 sideloaded apps per device. **SideStore** refreshes apps on-device over any Wi-Fi (not mobile data) using its on-device VPN plus an iOS Shortcuts automation. It needs a computer for initial setup and if it ever fully expires. AltStore is the alternative but only refreshes while AltServer runs on a computer on the same Wi-Fi.
- Test devices: owner's iPhone on iOS 18.7.8 or iOS 27.0.1 (a friend's is similar). Install on the iOS 18.7.8 phone first. On iOS 18, SideStore setup needs a pairing file generated on a computer.
- **SideStore on iOS 27 is unverified.** As of October 2026 there is no official SideStore statement. A third-party installer (SideInstaller) claims iOS 27 support, and a SideStore UDID bug was reported on some devices during the iOS 27 beta. These tools are unofficial and can break with iOS updates.
- The app looks different on the two phones. Apps built with the Xcode 26 SDK get the Liquid Glass system style on iOS 26 and later, while iOS 18 shows the older style. Tab bars, navigation bars, and sheets differ. Custom cards and chips look the same on both.
- Because there is no simulator, add lightweight on-device diagnostics (a hidden debug screen showing record counts and the last error) and have the app fail visibly instead of crashing silently.

### Not needed for v1

- **Paid Apple Developer Program ($99/yr)** is only required for TestFlight/App Store or capabilities like CloudKit and push notifications. v1 uses neither.

## Working style with Claude Code

- Before large changes, propose a short plan and wait for approval.
- Explain new Apple/Swift concepts in 1-3 sentences the first time they appear.
- Prefer the simplest approach that works; call out anything that will be painful to change later.
- You cannot build locally. Push and check CI (via `gh`) before declaring a task done; report the CI result, not a guess.
- Make small, frequent pushes so a CI failure points at a small change.
- Ask when a requirement is ambiguous instead of guessing, especially schema decisions.
- Each phase team keeps a running log in `teams/<team>/LOG.md`. Read `teams/README.md` and your team's log before starting work, and update the log with every commit and CI result.

## Pace

Owner can dedicate 10+ hours/week, so the full MVP (minus the yearly recap) is realistic in roughly a month or two. Still build in the order listed above and keep each step shippable.

## Visual style

Reference vibe: modern boba ordering apps such as 7 Leaves, Hey Tea, Auntea Jenny, Molly Tea, and Chagee. Take the general feel only: clean, card-based, soft rounded corners, generous whitespace, tea-inspired muted/pastel palette, and large tappable chips for size, sugar, ice, and toppings so logging takes a few taps. **Do not copy any brand's logos, names, fonts, illustrations, or assets.** Boba Note needs its own identity.

- **Palette:** taro purple as the accent, with white as the main surface color. Dark Mode needs its own variants (a dark surface and a lighter taro accent that stays readable on it). Define both in the theme file.
- Build reusable components early (chip selector, drink card, section header) so the whole app stays visually consistent.
- Support Dark Mode and Dynamic Type from the start; retrofitting them later is painful.
- Use SF Symbols for icons until custom artwork exists.

## Decided

- App name: **Boba Note**
- Minimum iOS version: **18**
- Bundle identifier: `com.briannguyen.bobanote`
- Persistence: a Codable JSON file, not SwiftData
- Palette: taro purple accent, white surfaces
- Stats use calendar periods. Top drinks are ranked within the selected period and grouped by drink name only.
- Rating is optional, 1 to 10. Drink date is a day, not a time.

## Open questions

- Exact SideStore setup path on iOS 27 vs iOS 18.7.8 (verify before first install)
- App icon
- Specific screenshots or mockups for the log flow, if the owner has any
