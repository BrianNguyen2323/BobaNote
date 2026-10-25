# Teams

Each MVP phase is owned by one team. A team is one or more agent sessions working on one branch. Every team has a folder here with a running `LOG.md`, so a new session can take over without the previous session's context.

## Teams

| Phase | Team folder | Branch | Status |
|---|---|---|---|
| 0. Foundation | [`web-foundation/`](web-foundation/LOG.md) | `phase-0/web-foundation` | In progress |
| 1. Data shell | [`data-shell/`](data-shell/LOG.md) | `phase-1/data-shell` | In progress |

The iOS build-loop team was retired when the project moved to the web. Its log and code are in git history at commit `9bc4b3d` on `main`.

## How to take over a team

1. Read `CLAUDE.md` in the repo root.
2. Read the team's `LOG.md`. The **Status** section says where the work stopped and what to do next.
3. Check out the team's branch and compare `git log` with the log's last entry. If they disagree, trust `git log` and fix the log first.

## How to keep a log

- Update **Status** whenever the next step changes.
- Add an entry under **Log** with each commit or CI result. Newest entries go at the bottom. Each entry has the date, what changed, and the evidence (commit SHA, CI run URL, or test output).
- Record every choice another team could trip over under **Decisions**.
- List what the team gives other teams under **Provides**: files, types, commands, and conventions they can rely on. When another team needs something from yours, it reads this section first.
- When the phase merges into `main`, set its row in the table above to "Merged".
