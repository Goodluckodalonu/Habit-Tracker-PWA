# Habit Tracker PWA

A mobile-first Progressive Web App for tracking daily habits with offline support and client-side persistence.

---

## Project Overview

The Habit Tracker PWA allows users to:
- Sign up and log in with email and password (no backend required)
- Create, edit, and delete daily habits
- Mark habits complete for today and track current streaks
- Reload the app and seamlessly retain all data
- Install the app as a PWA and use the cached app shell offline

---

## Setup

```bash
# Install dependencies
npm install

# Install Playwright browsers (required for E2E tests)
npx playwright install --with-deps chromium
```

**Requirements:** Node.js ≥ 18

---

## Running the App

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Running Tests

| Command | Description |
|---|---|
| `npm run test:unit` | Unit tests + coverage report |
| `npm run test:integration` | Component integration tests |
| `npm run test:e2e` | End-to-end Playwright tests |
| `npm test` | All tests in sequence |

> **E2E tests require the dev server.** `playwright.config.ts` is configured to auto-start `npm run dev` on port 3000.

---

## Local Persistence Structure

All data is stored in `localStorage` using these keys:

| Key | Type | Description |
|---|---|---|
| `habit-tracker-users` | `User[]` JSON | All registered users |
| `habit-tracker-session` | `Session \| null` JSON | Active session |
| `habit-tracker-habits` | `Habit[]` JSON | All habits across all users |

### Data Shapes

```ts
// habit-tracker-users
{ id: string; email: string; password: string; createdAt: string }[]

// habit-tracker-session
{ userId: string; email: string } | null

// habit-tracker-habits
{ id: string; userId: string; name: string; description: string;
  frequency: 'daily'; createdAt: string; completions: string[] }[]
```

Each habit's `completions` array contains unique ISO calendar dates in `YYYY-MM-DD` format.

---

## PWA Implementation

- **`public/manifest.json`** — defines the app name, icons (192×192 and 512×512), start URL (`/`), and display mode (`standalone`)
- **`public/sw.js`** — a cache-first service worker that:
  - Caches the app shell on install (`/`, `/login`, `/signup`, `/dashboard`)
  - Serves from cache first; falls back to network
  - Falls back to the cached root `'/'` when fully offline
- **`src/components/shared/ServiceWorkerRegistration.tsx`** — client component that registers the SW on mount via `navigator.serviceWorker.register('/sw.js')`

After the app has been loaded once, the cached app shell will render without a network connection.

---

## Trade-offs and Limitations

| Area | Decision | Trade-off |
|---|---|---|
| Persistence | `localStorage` only | Data is cleared if the user clears browser storage; not shared across devices |
| Auth | Plain text password in localStorage | Acceptable for a local-only stage; not suitable for production |
| Offline | App shell cached, dynamic data is not | Habits created offline are not synced anywhere |
| Session | JSON object in localStorage | Survives page reloads but not incognito-to-normal transitions |
| PWA icon | Same image used for 192 and 512 | Lower-quality at 512px; should be replaced with a proper 512px asset |

---

## Test File Map

| File | Behavior Verified |
|---|---|
| `tests/unit/slug.test.ts` | `getHabitSlug` — lowercase conversion, space trimming/collapsing, non-alphanumeric removal |
| `tests/unit/validators.test.ts` | `validateHabitName` — empty rejection, 60-char limit, trimmed valid return |
| `tests/unit/streaks.test.ts` | `calculateCurrentStreak` — empty, today missing, consecutive days, duplicates, gaps |
| `tests/unit/habits.test.ts` | `toggleHabitCompletion` — add, remove, immutability, no duplicates |
| `tests/integration/auth-flow.test.tsx` | Signup creates session, duplicate email error, login stores session, invalid credentials error |
| `tests/integration/habit-form.test.tsx` | Validation error on empty name, create renders in list, edit preserves immutable fields, delete requires confirmation, toggle updates streak |
| `tests/e2e/app.spec.ts` | Full user journey: splash, auth redirects, signup, login, create habit, complete habit, persist reload, logout, offline shell |
