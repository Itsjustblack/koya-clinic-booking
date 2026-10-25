# Koya Clinic Booking App

A small app for booking clinic appointments. Patients browse open slots by provider and availability, book one with their name and email, and look up or cancel their bookings later by email.

## What it does

- Lists appointment slots and shows each one as available, booked, or expired.
- Books a slot, with protection against double-booking the same slot and against duplicate submissions (idempotency keys).
- Looks up a person's bookings by email, with pagination.
- Cancels a booking, which frees up the slot again.
- Rate-limits booking attempts per email to stop abuse.

## Project layout

- [`clinic-api/`](clinic-api) — the backend API (NestJS, Prisma, PostgreSQL) that stores slots and bookings and enforces the booking rules.
- [`clinic-app/`](clinic-app) — the web frontend (React, Vite, TanStack Query) that patients use to browse slots and manage their bookings.

## Quick start

```bash
# backend
cd clinic-api
npm install
cp .env.example .env   # fill in DATABASE_URL, DIRECT_URL, API_KEY
npm run prisma:migrate
npm run start:dev

# frontend, in another terminal
cd clinic-app
npm install
cp .env.example .env.local   # fill in VITE_API_URL, VITE_API_KEY
npm run dev
```

The frontend opens at `http://localhost:5173` and talks to the backend over `VITE_API_URL`.

See [clinic-api/README.md](clinic-api/README.md) for the API reference, stack, and testing, and [clinic-app/README.md](clinic-app/README.md) for the frontend's features and project structure.
