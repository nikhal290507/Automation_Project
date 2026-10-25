# AutoFlow — Automate your digital life.

A full-stack AI-assisted personal automation SaaS. Connect Gmail, Google Calendar, Telegram, Outlook, and WhatsApp, then build simple `trigger → condition → action` workflows either visually or by describing them in plain English.

## Architecture

```
/client   React + TypeScript + Vite + Tailwind + shadcn-style UI kit
/server   Node + Express + TypeScript + PostgreSQL + Prisma
/prisma   schema.prisma + seed.ts (shared by the server)
```

The frontend and backend are fully independent — the client only ever talks to the server over REST (`/api/*`), authenticated with a JWT bearer token.

### Backend layout
```
server/src/
  controllers/     thin HTTP layer — validate input already done, call services, shape response
  routes/           Express routers, one per resource
  middleware/       auth (JWT), error handling, rate limiting, zod validation
  automation/        the execution engine: triggerService, conditionService, actionService, automationService
  ai/                aiService — real Anthropic API call with deterministic mock fallback
  integrations/      one file per external app (Gmail, Calendar, Telegram, Outlook, WhatsApp), all behind shared interfaces
  services/          notificationService, emailService, calendarService — façades over integrations
  utils/             prisma client, env loader, jwt helpers, AppError, asyncHandler
```

### Automation execution model
```
Trigger → Load Automation → Check Conditions → Execute Actions → Create Execution Log → Return Result
```
Implemented in `automation/automationService.ts::runAutomation()`. Every action is independent and reports its own success/failure so a partial failure doesn't silently swallow other actions.

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ (a local install, or a free instance from Supabase/Neon/Railway all work)

## Installation

```bash
# 1. Server
cd server
cp .env.example .env
# edit .env — at minimum set DATABASE_URL to your Postgres connection string
npm install
npm run prisma:generate
npm run prisma:migrate      # creates the schema (will prompt for a migration name)
npm run seed                # optional but recommended — creates a demo user + templates

# 2. Client (in a second terminal)
cd client
cp .env.example .env        # defaults to http://localhost:4000/api, fine for local dev
npm install
```

## Development

```bash
# Terminal 1
cd server && npm run dev     # http://localhost:4000

# Terminal 2
cd client && npm run dev     # http://localhost:5173
```

Demo login (if you ran the seed script): **demo@autoflow.app** / **password123**

## Environment variables

See `server/.env.example` for the full list. The important ones:

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes (production) | Falls back to an insecure dev default locally |
| `ANTHROPIC_API_KEY` | No | Without it, all AI features (classification, auto-reply, NL automation builder) run on a deterministic local mock instead of calling the real API |
| `GMAIL_CLIENT_ID` / `GMAIL_CLIENT_SECRET` | No | Without these, Gmail runs in mock mode with realistic sample data |
| `TELEGRAM_BOT_TOKEN` | No | Without it, "sending" a Telegram message just logs it server-side |
| `GOOGLE_CALENDAR_CLIENT_ID/SECRET`, `OUTLOOK_CLIENT_ID/SECRET`, `WHATSAPP_API_TOKEN` | No | Same mock-mode pattern |

**AutoFlow runs fully end-to-end with zero external credentials configured.** Every integration and the AI service has a deterministic mock provider so the whole product is testable locally on a fresh checkout.

## Database commands

```bash
npm run prisma:studio     # visual DB browser
npm run prisma:migrate    # apply schema changes
npm run seed               # re-seed demo data (safe to re-run — uses upsert for the demo user)
```

## Testing the app end-to-end

1. Register a new account (or log in with the demo user).
2. Complete onboarding: pick a role, connect Gmail/Calendar/Telegram (mock), set preferences, accept a couple of recommended templates.
3. On the Dashboard, click **Run now** on an automation card, or go to **Automations** → open one → **Run now**. Check **Activity** and the automation's execution history to confirm it logged a result.
4. Try the **AI Assistant** page and the "Describe with AI" tab on **Create automation** — both work without any API key via the mock provider.
5. Go to **Billing** and upgrade to Premium to unlock AI features and templates gated behind the plan (this flips a database flag; no real payment is processed).

## Features currently working

- Registration/login with JWT + bcrypt, protected routes
- Full onboarding flow (role → connect apps → preferences → recommended templates → workspace)
- Dashboard aggregating automations, focus status, important emails, meetings, activity, connected apps, and a daily AI summary
- Automation CRUD, enable/disable toggle, manual "Run now" against the real execution engine, execution history
- Visual automation builder (trigger/conditions/actions) and an AI natural-language builder (mock or real, based on `ANTHROPIC_API_KEY`)
- Role-filtered template library, one-click "use template"
- AI Assistant: email classifier and auto-reply generator (Premium-gated)
- Focus Mode: manual toggle + automatic activation via the `ENABLE_FOCUS_MODE` action, with history
- Connected Apps management (connect/disconnect, all mock mode)
- Activity log, Analytics (execution volume chart, top automations)
- Settings (profile, role) and Billing (Free/Premium plan, feature-gated automation limits and AI access)

## Integrations that require real OAuth/API credentials to go beyond mock mode

- **Gmail** — Google OAuth consent screen + Gmail API scopes
- **Google Calendar** — Google OAuth + Calendar API scopes
- **Outlook** — Microsoft Identity Platform app registration + admin consent
- **Telegram** — Bot token from `@BotFather` (`TELEGRAM_BOT_TOKEN`); this is the easiest one to go live with
- **WhatsApp** — Meta Business API approval
- **AI features** — real Anthropic responses require `ANTHROPIC_API_KEY`; otherwise a deterministic mock is used everywhere

Each integration lives behind a shared interface in `server/src/integrations/types.ts`, so swapping a mock provider for a live one only requires editing that one provider file — the automation engine, controllers, and frontend never change.

## Known simplifications (by design, for a working MVP)

- Triggers are evaluated on-demand (via "Run now" or an automation's `run` endpoint) rather than through real webhooks/push notifications from Gmail/Calendar — the engine itself is fully built to support that once real integrations are wired in.
- Billing has no real payment processor; upgrading/downgrading flips a `Subscription.plan` flag directly.
- "Choose Role" and "Connect Apps" (pages 5 & 6 in the original spec) are implemented as steps inside the single `/onboarding` flow rather than separate top-level routes, since they're only ever used in that sequence; role can be changed later from **Settings**, and apps can be managed later from **Connected Apps**.
