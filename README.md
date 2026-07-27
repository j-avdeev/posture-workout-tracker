# Posture & Strength Tracker

A mobile-friendly, installable static web app for tracking:

- a short daily posture routine;
- a five-minute warm-up with a guided timer;
- alternating home strength sessions (Workout A and Workout B);
- individual exercise completion and optional actual reps/times;
- countdown timers on every timed exercise;
- completed workout days, streaks, calendar history and progress;
- movement-break reminders for long computer sessions;
- local backups and optional private cross-device sync through Supabase, protected by a PIN.

The app has no build step and is designed for GitHub Pages. It works immediately with `localStorage`; Supabase is optional.

## Files

- `index.html` — application structure
- `styles.css` — responsive light/dark interface
- `app.js` — workout plan, tracking logic, calendar, statistics and sync
- `config.js` — optional public Supabase project configuration
- `supabase.sql` — tables and Row Level Security policies
- `manifest.webmanifest` and `service-worker.js` — installable/offline PWA support
- `.github/workflows/pages.yml` — automatic GitHub Pages deployment

## Run locally

A local web server is recommended because service workers do not run from `file://` URLs.

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`.

## Publish to GitHub Pages

1. Create a GitHub repository, for example `posture-workout-tracker`.
2. Upload or push all files from this folder to the repository's `main` branch.
3. Open **Repository settings → Pages**.
4. Under **Build and deployment**, select **GitHub Actions** as the source.
   This step cannot be skipped or automated from the workflow: the workflow's
   `GITHUB_TOKEN` may not create a Pages site, so `configure-pages` fails with
   `Get Pages site failed` until the site exists. The equivalent from a terminal
   with an admin token is:

   ```bash
   gh api -X POST repos/YOUR-USERNAME/posture-workout-tracker/pages -f build_type=workflow
   ```
5. Open the repository's **Actions** tab and wait for the Pages workflow to finish.
   If the first run failed before Pages was enabled, re-run it from that tab.
6. The site will normally be available at:
   `https://YOUR-USERNAME.github.io/posture-workout-tracker/`

Every later push to `main` automatically republishes the site. The deploy stamps
the commit SHA into the service worker's `CACHE_NAME`, so returning visitors get
the new version on their next page load instead of a stale cached one.

## Optional Supabase cloud sync

Local tracking works without Supabase. Configure cloud sync only when you want the same data on multiple devices.

### 1. Create and prepare the project

1. Create a Supabase project.
2. Open **SQL Editor** and run all statements from `supabase.sql`.
3. In **Project Settings → API**, copy:
   - the Project URL;
   - the browser-safe publishable key (or legacy anon key).

Never place a secret key or service-role key in this static application.

### 2. Configure the app

Edit `config.js`:

```js
window.APP_CONFIG = {
  SUPABASE_URL: 'https://YOUR-PROJECT.supabase.co',
  SUPABASE_PUBLISHABLE_KEY: 'YOUR-PUBLISHABLE-KEY'
};
```

The publishable key is visible in the browser by design. The included Row Level Security policies are what ensure that each signed-in user can access only their own rows.

### 3. Switch off email confirmation

In **Authentication → Sign In / Providers → Email**, turn **Confirm email** off.

Sign-in uses an email address plus a PIN, which Supabase stores as an ordinary password. With
confirmation enabled, `signUp` returns a user but no session and waits for an email, which
defeats the point of a PIN. With it off, creating the account signs you straight in.

Once you have registered every device you use, also switch **Allow new users to sign up** off.
The publishable key is public, so otherwise anyone could create an account in your project.

### 4. Configure email redirects

In **Authentication → URL Configuration**, set the Site URL to your deployed GitHub Pages URL
and add these to the allowed Redirect URLs:

```text
https://YOUR-USERNAME.github.io/posture-workout-tracker/
https://YOUR-USERNAME.github.io/posture-workout-tracker/**
http://localhost:8080/
```

The wildcard matters because the app builds its redirect from `origin + pathname`; landing on
`.../posture-workout-tracker/index.html` produces a different path. These URLs are only used
by the "Forgot your PIN?" recovery link.

### 5. Sign in

A gate appears on launch whenever Supabase is configured and no session exists:

- **Create account** — email plus a PIN of at least six digits (Supabase's default minimum
  password length). Store the PIN somewhere safe; it is the only way back to your history.
- **Sign in** — the same email and PIN on any other device.
- **Forgot your PIN?** sends a one-time email link; after following it, set a new PIN under
  **Settings → Change PIN**.
- **Continue on this device only** dismisses the gate and keeps the app fully usable offline
  with `localStorage`.

After signing in, local and cloud records are merged using their update timestamps.

**What the PIN does and does not protect.** Your cloud history is genuinely protected: without
the PIN there is no session, and the Row Level Security policies return no rows. What the PIN
does *not* do is encrypt local data — on a device where you have already signed in,
`localStorage` is still readable through browser devtools. The gate is a front door, not a
vault.

## Warm-up and timers

The warm-up lives in its own always-visible card above the strength session, because it is
shared by Workout A and Workout B. Each of its five movements is framed as one minute, so
the whole block is the five minutes the plan asks for.

- **Run the whole warm-up** steps through all five movements automatically, beeping between
  them, ticking each one off, and holding a screen wake lock so the phone does not sleep.
- **▶ buttons** appear on any exercise that has a `seconds` value in its plan entry — the
  warm-up movements, the side plank, and the thoracic extension. When a countdown reaches
  zero the app beeps and checks the exercise off.
- On a rest day the warm-up card stays visible but is excluded from the day's completion
  percentage, so it can never block a 100% day.

Countdowns run against a wall-clock deadline rather than counting ticks, so a backgrounded
tab or a locked phone does not stretch them.

## Customise the workout plan

The exercise definitions are near the top of `app.js` inside the `PLANS` object:

- `PLANS.daily`
- `PLANS.A`
- `PLANS.B`

Each exercise has an `id`, `name`, `target`, technique `cue`, and `group`. Keep existing IDs stable after you start logging data; changing an ID makes the exercise appear as a new item.

The default strength days are Monday, Wednesday and Saturday. They can be changed from the app's Settings screen.

## Data and privacy

- Without Supabase, all workout data stays in that browser's `localStorage`.
- Use **Settings → Export JSON** for backups.
- With Supabase, PIN authentication and Row Level Security restrict records to the signed-in user.
- The PIN gates cloud access; it does not encrypt local data on a device you already signed in on.
- This tracker stores exercise completion and optional notes. Avoid entering sensitive medical information in a public/shared browser.

## Health note

This app is a checklist for the described exercise plan, not a diagnosis or a substitute for an in-person medical or physiotherapy assessment. Stop an exercise that causes sharp, radiating or progressively increasing pain.
