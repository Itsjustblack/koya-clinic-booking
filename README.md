# Koya Clinic — Frontend

The web frontend for the Koya Clinic booking app. Patients use it to browse open appointment slots, book one, and look up or cancel their bookings by email.

## Features

- **Browse slots** — filter by provider and by availability (available / unavailable), with client-side pagination.
- **Slot status** — each slot shows as Available, Booked, or Expired (an available slot whose start time has already passed), and the booking button is disabled unless the slot is actually bookable.
- **Book a slot** — a dialog collects name and email, validates them, and submits the booking. Duplicate submissions are protected with an idempotency key.
- **Booking confirmation** — a confirmation dialog shows the booking details after a successful booking.
- **My Bookings** — look up bookings by email (paginated) and cancel a confirmed booking, which frees the slot again.
- **Feedback** — success and error states surface as toasts (via [sonner](https://sonner.emilkowal.ski/)) as well as inline alerts, including rate-limit messages with a countdown.

## Tech stack

- [React 19](https://react.dev/) + [Vite](https://vite.dev/) + TypeScript
- [TanStack Query](https://tanstack.com/query) for data fetching, caching, and mutations
- [Tailwind CSS v4](https://tailwindcss.com/) with [shadcn](https://ui.shadcn.com/)-style components built on [Base UI](https://base-ui.com/)
- [Axios](https://axios-http.com/) for HTTP requests to the API

## Getting started

### Prerequisites

The [clinic-api](../clinic-api) backend running and reachable — this app is a pure client for that API.

### Setup

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local`:

```
VITE_API_URL=http://localhost:8000
VITE_API_KEY=<your clinic-api API key>
```

### Run

```bash
npm run dev
```

Opens at `http://localhost:5173`.

### Other scripts

```bash
npm run build    # type-check and build for production
npm run lint     # run eslint
npm run preview  # preview the production build locally
```

## Project structure

```
src/
  components/ui/      shared UI primitives (button, dialog, select, toaster, ...)
  features/
    slots/             slot browsing: api calls, hooks, components, status logic
    bookings/           booking creation, lookup, and cancellation
  lib/                 api client, error formatting, date/time formatting
  providers/           app-wide providers (TanStack Query)
  types/               shared API types
```

Each feature folder follows the same shape: `api.ts` for HTTP calls, `hooks/` for the TanStack Query hooks built on top of them, and `components/` for the UI.
