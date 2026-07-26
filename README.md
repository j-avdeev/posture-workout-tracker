# Posture & Strength Tracker

A mobile-friendly, installable static web app for tracking:

- a short daily posture routine;
- alternating home strength sessions (Workout A and Workout B);
- individual exercise completion and optional actual reps/times;
- completed workout days, streaks, calendar history and progress;
- movement-break reminders for long computer sessions;
- local backups and optional private cross-device sync through Supabase.

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
5. Open the repository's **Actions** tab and wait for the Pages workflow to finish.
6. The site will normally be available at:
   `https://YOUR-USERNAME.github.io/posture-workout-tracker/`

Every later push to `main` automatically republishes the site.

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

### 3. Configure email redirects

In Supabase, open **Authentication → URL Configuration**.

Set the Site URL to your deployed GitHub Pages URL and add that same URL to the allowed Redirect URLs, for example:

```text
https://YOUR-USERNAME.github.io/posture-workout-tracker/
```

The app uses passwordless email magic links. After signing in, local and cloud records are merged using their update timestamps.

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
- With Supabase, email authentication and Row Level Security restrict records to the signed-in user.
- This tracker stores exercise completion and optional notes. Avoid entering sensitive medical information in a public/shared browser.

## Health note

This app is a checklist for the described exercise plan, not a diagnosis or a substitute for an in-person medical or physiotherapy assessment. Stop an exercise that causes sharp, radiating or progressively increasing pain.
