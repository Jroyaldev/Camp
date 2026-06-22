# Right Now · Cabin F

A live camp day-schedule web app for a Cabin F counselor. It reads your device
clock and always shows **what's happening right now**, **what's next**, and the
**full timeline** for the day — with your Cabin F duties flagged.

Built from the official C.T.C.C. weekday schedule (ctccamp.org). Sunday (arrival)
and Saturday (checkout) times are estimates and are editable in-app.

## Highlights

- **Dependable / offline-first** — installable PWA with a service worker that
  caches everything (including self-hosted fonts), so it keeps working with no
  signal at camp.
- **Mobile optimized** — safe-area / notch handling, large touch targets, a
  sticky live clock, and a floating "jump to now" button.
- **Better UX** — preview any day with the day picker, a "my duties only"
  filter, a day-progress indicator, a current-block progress bar, and an
  editable times bottom sheet. Light & dark themes.

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
assets/js/schedule.js      schedule data (the camp grid + Cabin F duties)
assets/js/app.js           rendering + interaction logic
assets/fonts/              self-hosted woff2 fonts + fonts.css
icons/                     app icons (svg + png)
```

## Editing the schedule

Time tweaks are done in-app (saved to `localStorage`). To change labels, details,
or duty flags, edit `assets/js/schedule.js`.
