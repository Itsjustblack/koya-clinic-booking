# Clinic Booking API

A REST API for booking clinic appointment slots, built with NestJS, Prisma, and Postgres.

It covers listing slots, creating and cancelling bookings, idempotent booking creation, per-email rate limiting, and cursor-paginated booking lists. The full spec lives in [PROJECT.md](PROJECT.md).

## Stack

- [NestJS](https://nestjs.com) on Express
- [Prisma](https://www.prisma.io) (`@prisma/client` + `@prisma/adapter-pg`) against Postgres
- [Vitest](https://vitest.dev) for unit and e2e tests
- `class-validator` / `class-transformer` for request validation

## Setup

Install dependencies:

```bash
npm install
```

Copy the env template and fill in your database and API key:

```bash
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

## Running the app

```bash
# development, with file watching
npm run start:dev

# plain start
npm run start

# production (runs pending migrations first, then starts)
npm run start:prod
```

## Testing

```bash
# unit tests
npm run test

# end-to-end tests
npm run test:e2e

# coverage
npm run test:cov
```

## API overview

Every request needs an `X-API-Key` header matching `API_KEY`. Every error response has the shape `{ "error": "<message>" }`. All routes are served under the `/api` prefix.

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/reset` | Wipe all bookings and slots, then load the slots given in the request body. For tests and seeding — not for production data. |
| `GET` | `/api/slots` | List every slot, earliest `start` first. Optional `provider` query filter. |
| `POST` | `/api/bookings` | Book a slot. Supports an optional `Idempotency-Key` header and is rate-limited per email. |
| `GET` | `/api/bookings` | List one person's bookings by `email`, earliest slot `start` first, with cursor pagination (`limit`, `cursor`). |
| `GET` | `/api/bookings/:id` | Look up a single booking. |
| `DELETE` | `/api/bookings/:id` | Cancel a booking and free its slot. |

See [PROJECT.md](PROJECT.md) for full request/response shapes, validation rules, and status codes.

## Project layout

```
src/
  bookings/     booking CRUD, cursor pagination, idempotency
  slots/        slot listing and reset/seed endpoint
  common/       API key guard, rate-limit guard, shared error messages
  database/     Prisma service wrapper
prisma/
  schema.prisma Slot and Booking models, migrations
```

## Notes

- Confirmed bookings are enforced one-per-slot at the database level (a partial unique index on `slotId` where `status = 'confirmed'`), so double-booking fails even under concurrent requests.
- Idempotency is implemented by storing the key directly on the `Booking` row rather than a separate table.
- Rate limiting is five booking attempts per email per minute; the sixth returns `429` with `Retry-After`.
