# AutoFlow — Automation Dashboard

A frontend-only, premium SaaS-style automation dashboard for students and professionals.
No backend, no database, no API keys, no authentication service — everything runs and
persists entirely in your browser via `localStorage`.

## Stack

- React 19 + Vite + TypeScript
- Tailwind CSS
- React Router (HashRouter — works from any static host, no server config needed)
- Lucide React icons
- `localStorage` for all persistence

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (typically `http://localhost:5173`).

To build for production:

```bash
npm run build
npm run preview   # serves the production build locally
```

The production build is a fully static site (`dist/`) — deploy it to any static host
(Netlify, Vercel, GitHub Pages, S3, etc.) with zero configuration.

## Using the app

1. **Sign in** — Demo Mode: any email/password combination works, nothing is validated
   or sent anywhere.
2. **Choose a role** — Student or Professional (saved locally, changeable later in Settings).
3. **Connect apps** — Gmail, Google Calendar, Telegram, WhatsApp are all *simulated*
   connections for demo purposes. No real OAuth or API calls are made.
4. **Dashboard** — overview stats, recent emails, upcoming meetings, active automations,
   quick actions, and a productivity summary.

From the sidebar you can reach:

- **Inbox** — search, filter by category, sort, mark important/spam, archive, delete,
  open full email detail.
- **Calendar** — a weekly view with add/edit/delete events (title, date, time range, category).
- **Automations** — build IF → THEN rules (sender/subject/category/keyword conditions;
  mark important/spam, move category, archive, or create a task as actions). Includes a
  "Run All Automations" button that applies every enabled rule against the demo inbox.
- **Focus Mode** — start a timed focus session, see a live countdown, and a history of
  past sessions. Notifications are shown as muted while a session is active.
- **Tasks** — add/complete/delete tasks with priority and due date, filter active vs completed.
- **Activity** — a running log of everything automations, focus sessions, and calendar
  actions have done, with a "Clear Activity" option.
- **Settings** — profile, role, connected apps, notification preferences, theme toggle,
  reset demo data, and logout.

All demo data (emails, events, automations, tasks) is seeded once on first load and then
lives entirely in `localStorage` under keys prefixed `autoflow:`. Use **Settings → Reset
Demo Data** to wipe everything and start fresh.

## Folder structure

```
autoflow/
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── vite.config.ts
├── public/
│   └── favicon.svg
└── src/
    ├── main.tsx              # React entrypoint
    ├── App.tsx                # Router setup
    ├── index.css              # Tailwind base + global styles
    ├── types/
    │   └── index.ts           # Shared TypeScript interfaces
    ├── lib/
    │   ├── storage.ts         # Centralized localStorage helpers
    │   └── seed.ts            # Demo data generators
    ├── store/
    │   └── AppContext.tsx     # Global app state (React Context) + all actions
    ├── components/
    │   ├── DashboardLayout.tsx
    │   ├── Sidebar.tsx
    │   ├── Topbar.tsx
    │   ├── MobileNav.tsx
    │   ├── Toaster.tsx
    │   ├── ConfirmDialog.tsx
    │   └── Common.tsx         # Card, Badge, EmptyState, Spinner helpers
    └── pages/
        ├── Login.tsx
        ├── RoleSelect.tsx
        ├── ConnectApps.tsx
        ├── Dashboard.tsx
        ├── Inbox.tsx
        ├── Calendar.tsx
        ├── Automations.tsx
        ├── Focus.tsx
        ├── Tasks.tsx
        ├── ActivityPage.tsx
        └── Settings.tsx
```

## Notes

- All "connections" (Gmail, Calendar, Telegram, WhatsApp) are simulated UI state only —
  no real API/OAuth integration is attempted anywhere in the codebase.
- Verified: `npm install` and `npm run dev` work immediately; `npm run build`
  (`tsc -b && vite build`) completes with zero TypeScript or build errors.
