# Boba Note

Log your boba drinks and see your habits over time. A Next.js web app with a taro purple, liquid glass look.

## Run it locally

You need Node.js 22 (the version is pinned in `.nvmrc`).

```
npm install
npm run dev
```

Open `http://localhost:3000`. To try it on your phone, run `npm run dev -- -H 0.0.0.0` and open `http://<your PC's LAN IP>:3000` on a phone on the same Wi-Fi.

## Checks

```
npm run lint
npm test
npm run build
```

CI runs the same three commands on every push.

## Where things live

- `src/app/` holds the pages. `globals.css` holds the theme tokens and the `glass` utility.
- `src/components/` holds the reusable UI components.
- `src/lib/` holds plain TypeScript logic and its tests.
- `teams/` holds the running log for each build phase.
- `CLAUDE.md` holds the product plan and the project rules.
