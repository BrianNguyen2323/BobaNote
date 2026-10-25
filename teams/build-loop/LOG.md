# Build loop team (phase 0)

Branch: `phase-0/build-loop`. Goal: prove that code written on Windows becomes an app on the owner's iPhone, before any feature work.

## Status

CI is green. Waiting on the owner to install the `.ipa` from run 40157118203 on the iOS 18.7.8 iPhone through SideStore. If the install fails, record the exact SideStore error here before changing anything.

## Done when

- [x] `project.yml` describes the app (bundle ID `com.briannguyen.bobanote`, iOS 18).
- [x] `BobaNoteCore` package exists with one tested function.
- [x] One-screen app imports `BobaNoteCore`.
- [x] `.github/workflows/ci.yml` runs the core tests, builds an unsigned app, and uploads `BobaNote.ipa`.
- [x] CI is green on this branch.
- [ ] Owner installs the `.ipa` on the iOS 18.7.8 iPhone through SideStore, and the screen shows the commit SHA of that build.
- [ ] Branch merged into `main`, and the `latest` release on GitHub has the `.ipa`.

## Provides

- **App target.** `BobaNote/` holds the app's Swift files. Add new app files there. XcodeGen picks up every file in that folder, so `project.yml` needs no edit for new files.
- **Core package.** `BobaNoteCore/` is a Swift package that imports only Foundation. Put models and logic in `Sources/BobaNoteCore/` and tests in `Tests/BobaNoteCoreTests/`. Tests use Swift Testing (`import Testing`, `@Test`, `#expect`).
- **`DrinkName.normalized(_:)`** returns the grouping key for a drink name. It trims, collapses inner whitespace, and lowercases.
- **Build ID on device.** The Info.plist key `BobaNoteCommit` holds the short commit SHA of the CI build, or `dev` for local builds. The debug screen in phase 1 should show it.
- **Getting a build.** Every push to any branch uploads a `BobaNote-<sha>` artifact on its Actions run. Every push to `main` also replaces the `latest` pre-release on GitHub with the new `.ipa`. You can download a release on the iPhone without signing in to GitHub.

## Decisions

| Decision | Why |
|---|---|
| Runner `macos-26` (arm64, Xcode 26.x default) | The newest stable GitHub image. `macos-latest` points to it today but moves without notice. |
| `brew install xcodegen` in CI | The XcodeGen version stays current without a pinned download URL. |
| App target uses Swift 6 with `SWIFT_DEFAULT_ACTOR_ISOLATION: MainActor` | Matches the Xcode 26 new-project default. App code runs on the main thread unless marked otherwise, which avoids most concurrency errors for UI code. `BobaNoteCore` keeps the package default (no global actor). |
| iPhone only, portrait only | A logging app needs neither iPad layouts nor rotation. Add later only if asked. |
| Unsigned build with `CODE_SIGNING_ALLOWED=NO` passed in CI, not set in `project.yml` | A future Mac build can still sign normally. |
| CI runs on push to every branch | Branches are pushed without PRs during development. A newer push to the same branch cancels the older run. |
| `NSLocationWhenInUseUsageDescription` not added yet | Phase 5 adds it with the location code. An unused permission string has no effect today. |

## Log

- **2026-10-24.** Branched `phase-0/build-loop` from `docs/claude-md-plan` (`62a7499`), because `main` does not have CLAUDE.md yet. Merging this branch brings that commit along. Installed the GitHub CLI 2.103.2 at `~/bin/gh.exe` on the owner's PC. It needs `gh auth login` once before it can read CI logs. Wrote `.gitattributes` (LF line endings), `.gitignore`, `project.yml`, `BobaNoteCore`, the one-screen app, and `ci.yml`. No Swift toolchain on this PC, so nothing compiled locally. CI is the first build.
- **2026-10-24.** First CI run passed on `1c46728`: [run 40157118203](https://github.com/BrianNguyen2323/BobaNote/actions/runs/40157118203). Both jobs (`core-tests` and `app`) succeeded. The run uploaded artifact `BobaNote-1c46728...` (12,468 bytes zipped). Its contents are not inspected yet, because downloading artifacts needs `gh auth login`. The on-device install is the real check.
