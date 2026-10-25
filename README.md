# Koya Clinic Booking App

A small app for booking clinic appointments. Patients browse open slots by provider and availability, book one with their name and email, and look up or cancel their bookings later by email.

## What it does

- Lists appointment slots and shows each one as available, booked, or expired.
- Books a slot, with protection against double-booking the same slot and against duplicate submissions (idempotency keys).
- Looks up a person's bookings by email, with pagination.
- Cancels a booking, which frees up the slot again.
- Rate-limits booking attempts per email to stop abuse.

## Project layout

- `clinic-api/` — the backend API (NestJS, Prisma, PostgreSQL) that stores slots and bookings and enforces the booking rules.
- `clinic-app/` — the web frontend (React, Vite, TanStack Query) that patients use to browse slots and manage their bookings.

---

## `clinic-api` — backend

A REST API for booking clinic appointment slots, built with NestJS, Prisma, and Postgres.

It covers listing slots, creating and cancelling bookings, idempotent booking creation, per-email rate limiting, and cursor-paginated booking lists. The full spec lives in [clinic-api/PROJECT.md](clinic-api/PROJECT.md).

### Stack

- [NestJS](https://nestjs.com) on Express
- [Prisma](https://www.prisma.io) (`@prisma/client` + `@prisma/adapter-pg`) against Postgres
- [Vitest](https://vitest.dev) for unit and e2e tests
- `class-validator` / `class-transformer` for request validation

### Setup

```bash
cd clinic-api
npm install
cp .env.example .env
```

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string used at runtime (pooled). |
| `DIRECT_URL` | Direct Postgres connection used for migrations. |
| `PORT` | Port the server listens on. Defaults to `3000`. |
| `API_KEY` | The key clients must send in the `X-API-Key` header. |

Run migrations:

```bash
npm run prisma:migrate
```

### Running the app

```bash
# development, with file watching
npm run start:dev

# plain start
npm run start

# production (runs pending migrations first, then starts)
npm run start:prod
```

### Testing

```bash
# unit tests
npm run test

# end-to-end tests
npm run test:e2e

# coverage
npm run test:cov
```

### API overview

Every request needs an `X-API-Key` header matching `API_KEY`. Every error response has the shape `{ "error": "<message>" }`.

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/reset` | Wipe all bookings and slots, then load the slots given in the request body. For tests and seeding — not for production data. |
| `GET` | `/slots` | List every slot, earliest `start` first. Optional `provider` query filter. |
| `POST` | `/bookings` | Book a slot. Supports an optional `Idempotency-Key` header and is rate-limited per email. |
| `GET` | `/bookings` | List one person's bookings by `email`, earliest slot `start` first, with cursor pagination (`limit`, `cursor`). |
| `GET` | `/bookings/:id` | Look up a single booking. |
| `DELETE` | `/bookings/:id` | Cancel a booking and free its slot. |

See [clinic-api/PROJECT.md](clinic-api/PROJECT.md) for full request/response shapes, validation rules, and status codes.

### Project layout

```
clinic-api/src/
  bookings/     booking CRUD, cursor pagination, idempotency
  slots/        slot listing and reset/seed endpoint
  common/       API key guard, rate-limit guard, shared error messages
  database/     Prisma service wrapper
clinic-api/prisma/
  schema.prisma Slot and Booking models, migrations
```

### Notes

- Confirmed bookings are enforced one-per-slot at the database level (a partial unique index on `slotId` where `status = 'confirmed'`), so double-booking fails even under concurrent requests.
- Idempotency is implemented by storing the key directly on the `Booking` row rather than a separate table.
- Rate limiting is five booking attempts per email per minute; the sixth returns `429` with `Retry-After`.

---

## `clinic-app` — frontend

The web frontend for the Koya Clinic booking app. Patients use it to browse open appointment slots, book one, and look up or cancel their bookings by email.

### Features

- **Browse slots** — filter by provider and by availability (available / unavailable), with client-side pagination.
- **Slot status** — each slot shows as Available, Booked, or Expired (an available slot whose start time has already passed), and the booking button is disabled unless the slot is actually bookable.
- **Book a slot** — a dialog collects name and email, validates them, and submits the booking. Duplicate submissions are protected with an idempotency key.
- **Booking confirmation** — a confirmation dialog shows the booking details after a successful booking.
- **My Bookings** — look up bookings by email (paginated) and cancel a confirmed booking, which frees the slot again.
- **Feedback** — success and error states surface as toasts (via [sonner](https://sonner.emilkowal.ski/)) as well as inline alerts, including rate-limit messages with a countdown.

### Tech stack

- [React 19](https://react.dev/) + [Vite](https://vite.dev/) + TypeScript
- [TanStack Query](https://tanstack.com/query) for data fetching, caching, and mutations
- [Tailwind CSS v4](https://tailwindcss.com/) with [shadcn](https://ui.shadcn.com/)-style components built on [Base UI](https://base-ui.com/)
- [Axios](https://axios-http.com/) for HTTP requests to the API

### Getting started

#### Prerequisites

The `clinic-api` backend running and reachable — this app is a pure client for that API.

#### Setup

```bash
cd clinic-app
npm install
cp .env.example .env.local
```

Fill in `.env.local`:

```
VITE_API_URL=http://localhost:8000
VITE_API_KEY=<your clinic-api API key>
```

#### Run

```bash
npm run dev
```

Opens at `http://localhost:5173`.

#### Other scripts

```bash
npm run build    # type-check and build for production
npm run lint     # run eslint
npm run preview  # preview the production build locally
```

### Project structure

```
clinic-app/src/
  components/ui/      shared UI primitives (button, dialog, select, toaster, ...)
  features/
    slots/             slot browsing: api calls, hooks, components, status logic
    bookings/           booking creation, lookup, and cancellation
  lib/                 api client, error formatting, date/time formatting
  providers/           app-wide providers (TanStack Query)
  types/               shared API types
```

Each feature folder follows the same shape: `api.ts` for HTTP calls, `hooks/` for the TanStack Query hooks built on top of them, and `components/` for the UI.
