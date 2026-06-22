# C.T.C.C. Camp Companion

A live camp day-schedule web app for C.T.C.C. counselors. It reads your device
clock and always shows **what's happening right now**, **what's next**, and the
**full timeline** for the day — with **your cabin's duties flagged**.

Each counselor sets their **cabin, section, and grade** once; the app then
personalizes everything (kitchen shifts, bathhouse crew, devo nights, your Bible
class location). Nothing is hard-coded to a single cabin.

Built from the official C.T.C.C. weekday schedule (ctccamp.org). Sunday (arrival)
and Saturday (checkout) times are estimates and are editable in-app.

## Highlights

- **Dependable / offline-first** — installable PWA with a service worker that
  caches everything (including self-hosted fonts), so it keeps working with no
  signal at camp.
- **Mobile optimized** — bottom tab bar, safe-area / notch handling, large touch
  targets, a sticky live clock, and a floating "jump to now" button.
- **Better UX** — four tabs: **Now** (live), **Week** (browse all 7 days),
  **Mine** (your duties across the week), and **Info** (Bible-class locations,
  teacher rotations, awards rules, theme days). Plus a "my duties only" filter,
  progress indicators, an editable-times bottom sheet, and light/dark themes.

## Run locally

It's a static site — no build step.

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

A web server is required (not `file://`) so the service worker and ES modules load.

## Project layout

```
index.html                 app shell
manifest.webmanifest       PWA manifest
sw.js                      service worker (offline cache)
assets/css/styles.css      styles (responsive, theming, components)
assets/js/schedule.js      schedule data (camp grid, cabin assignments, class & info reference)
assets/js/app.js           rendering + interaction logic
assets/fonts/              self-hosted woff2 fonts + fonts.css
icons/                     app icons (svg + png)
```

## Editing the schedule

Time tweaks and your cabin setup are done in-app (saved to `localStorage`). To
change labels, details, cabin assignments (`assign`), or the class/info reference
data, edit `assets/js/schedule.js`.
