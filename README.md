# Boba Note

Log your boba drinks and see your habits over time. A Next.js web app with a taro purple, liquid glass look. Users sign in with Google, and their drinks are stored in Supabase.

## Run it locally

You need Node.js 22 (the version is pinned in `.nvmrc`).

```
npm install
npm run dev
```

Open `http://localhost:3000`. The app needs the services below before any page loads. Until then, every page shows an error naming the first missing variable.

## Connect the services

All app credentials go in `.env.local` in the repo root. Git ignores that file. If it doesn't exist, copy `.env.example` to `.env.local`. Each variable has a comment saying where its value comes from. Restart `npm run dev` after you edit the file.

The steps below follow the Supabase and Google dashboards as of October 2026. Menu names can move.

### 1. Create the Supabase project

1. Sign in at supabase.com and create a new project on the free plan. Save the database password somewhere safe. The app doesn't need it.
2. Open the project and click **Connect** (or go to **Project Settings > API Keys**).
3. Paste the **Project URL** into `.env.local` after `NEXT_PUBLIC_SUPABASE_URL=`.
4. Paste the **publishable key** (it starts with `sb_publishable_`) after `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=`. Never use the secret key in this app.
5. Go to **Authentication > URL Configuration**. Set **Site URL** to `http://localhost:3000`. Under **Redirect URLs**, add `http://localhost:3000/auth/callback`.

### 2. Create the drinks table

1. In Supabase, open **SQL Editor** and start a new query.
2. Paste the whole file `supabase/migrations/20261024000000_create_drink_logs.sql` and click **Run**.
3. Open **Table Editor**. The `drink_logs` table should be there with row level security turned on.

### 3. Set up Google sign-in

1. Sign in at console.cloud.google.com and create a project (or pick one).
2. Open **Google Auth Platform**.
   - **Branding.** Enter the app name "Boba Note" and your support email.
   - **Audience.** Choose **External** and leave the app in **Testing**. Under **Test users**, add your Google account. Add each friend's Google address here when you invite them. Only listed accounts can sign in.
   - **Data Access.** Add the `openid` scope. The email and profile scopes are already there.
3. Still in Google Auth Platform, open **Clients** and create a client with type **Web application**.
   - **Authorized JavaScript origins.** Add `http://localhost:3000`.
   - **Authorized redirect URIs.** Add your Supabase callback URL. Copy it from Supabase under **Authentication > Sign In / Providers > Google**. It looks like `https://<your-project-ref>.supabase.co/auth/v1/callback`.
4. Click **Create** and copy the **Client ID** and **Client Secret**.
5. Back in Supabase, under **Authentication > Sign In / Providers > Google**, turn Google on, paste the Client ID and Client Secret, and save. These two values do not go in `.env.local`.

### 4. Set up Google Places

1. In the same Google Cloud project, link a billing account (**Billing**). Places requires one, even within the free monthly allowance.
2. Go to **APIs & Services > Library**, find **Places API (New)**, and click **Enable**.
3. Go to **APIs & Services > Credentials**, click **Create credentials > API key**, and copy the key.
4. Edit the key. Under **API restrictions**, choose **Restrict key** and select only **Places API (New)**. Leave application restrictions at **None**, because only our server calls it.
5. Paste the key into `.env.local` after `GOOGLE_PLACES_API_KEY=`.
6. Protect your card. Under **APIs & Services > Places API (New) > Quotas**, lower the daily request limit (200 a day is plenty for a few friends). Under **Billing > Budgets & alerts**, add a small budget, such as $5, with email alerts.

### 5. Check that it works

1. Restart `npm run dev` and open `http://localhost:3000`. You land on the sign-in page.
2. Click **Continue with Google** and pick your account. You come back to the style preview page, which says "Signed in as" with your name.
3. While signed in, open `http://localhost:3000/api/places?q=boba` in the same browser. You should see a JSON list of shops. Signed out, the same URL answers `{"error":"Sign in first."}`.

Sign-in returns only to addresses on Supabase's redirect list. To test on your phone over Wi-Fi, run `npm run dev -- -H 0.0.0.0` and add your PC's LAN callback (for example `http://192.168.1.20:3000/auth/callback`) under Supabase's **Redirect URLs**. Google's client settings don't need it, because Google sends you back to Supabase, not to the app.

## Checks

```
npm run lint
npm test
npm run build
```

CI runs the same three commands on every push. It needs no secrets.

## Where things live

- `src/app/` holds the pages. `globals.css` holds the theme tokens and the `glass` utility.
- `src/app/auth/` holds sign-in, sign-out, and the Google callback. `src/proxy.ts` refreshes the session and redirects signed-out visitors.
- `src/app/api/places/` is the shop search endpoint.
- `src/components/` holds the reusable UI components.
- `src/lib/` holds TypeScript logic and its tests.
- `supabase/migrations/` holds the database schema as SQL files.
- `teams/` holds the running log for each build phase.
- `CLAUDE.md` holds the product plan and the project rules.
