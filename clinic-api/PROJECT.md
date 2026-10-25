# Clinic Booking API

Build a clinic booking API and a simple web page that uses it to:

- list available appointment slots;
- book an appointment slot; and
- show a booking confirmation.

Complete each level in order. Do not move to the next level until the current level works.

## Levels

### Level 1

- List slots.
- Replace all slots with test data.
- Book a slot.
- Look up a booking by ID.

### Level 2

- Require the `X-API-Key` header on every request.
- Return `401` when the key is missing or wrong.
- Reject bookings with missing or empty `slot_id`, `name`, or `email`.
- Reject invalid email addresses.
- Return `404` when the slot does not exist.
- Reject bookings for slots that have already started.
- Trim `name` and `email` before storing them.
- Store email addresses in lower case.

### Level 3

- Never allow two confirmed bookings for the same slot, including simultaneous requests.
- Return `409` when a slot already has a confirmed booking.
- Cancel bookings.
- Free the slot when its booking is cancelled.

### Level 4

- Support the optional `Idempotency-Key` header when creating bookings.
- Repeating the same key with the same body must return the same status and booking ID without creating another booking.
- Return `422` when the same key is used with a different body.
- Let a person list their bookings with cursor pagination.

#### Idempotency implementation

Keep idempotency simple by storing the key on the booking instead of creating a separate idempotency table.

- Add a nullable, unique `idempotencyKey` field to `Booking`.
- Trim `name` and `email`, and lowercase `email`, before comparing or storing the request.
- If a request includes a key and a booking already has that key, compare `slot_id`, `name`, and `email` with the stored booking.
- Return the stored booking when all fields match.
- Return `422` when the same key has different booking details.
- If no booking has the key, create the booking with that key.
- If two identical requests arrive together, let the database unique constraint accept one insert; fetch and return the existing booking after the other insert gets a duplicate-key error.
- Requests that fail before a booking is created do not store an idempotency result and may be tried again.

This design uses Postgres for idempotency. Redis or In-memory Cache remains reserved for the Level 5 rate limit counters.

### Level 5

- Allow at most five booking attempts per email per minute, including failed attempts.
- Return `429` for the sixth attempt in that minute.
- Include `Retry-After` in whole seconds with the `429` response.
- Rate-limit each email separately.

## API requirements

All requests and responses use JSON. Every request must include:

```http
X-API-Key: <your-api-key>
```

Every error response has this shape:

```json
{
  "error": "<message>"
}
```

The API must expose these endpoints.

## `POST /reset`

Level 1. Delete every booking and replace all slots with the slots in the request, including slots in the past.

### Request body

```json
{
  "slots": [
    {
      "id": "s1",
      "provider": "Dr Ade",
      "start": "2026-12-10T09:00:00Z",
      "end": "2026-12-10T09:30:00Z"
    }
  ]
}
```

The request body must contain a `slots` array. Return `200` when the reset is done.

## `GET /slots`

Level 1. Return every slot, ordered by earliest `start` first.

### Query parameters

| Name | Required | Description |
| --- | --- | --- |
| `provider` | No | Return only slots whose provider exactly matches this value. |

### Response `200`

```json
{
  "slots": [
    {
      "id": "s1",
      "provider": "Dr Ade",
      "start": "2026-12-10T09:00:00Z",
      "end": "2026-12-10T09:30:00Z",
      "available": true
    }
  ]
}
```

`available` must be `false` while the slot has a confirmed booking.

## `POST /bookings`

Levels 1–5. Create a booking for a slot.

### Request headers

```http
X-API-Key: <your-api-key>
Idempotency-Key: <optional-key>
```

`Idempotency-Key` is optional. When provided, apply the Level 4 idempotency rules.

### Request body

```json
{
  "slot_id": "s1",
  "name": "Ada Obi",
  "email": "ada@example.com"
}
```

All three fields are required strings.

### Response `201`

```json
{
  "id": "V1StGXR8_Z5L",
  "slot_id": "s1",
  "name": "Ada Obi",
  "email": "ada@example.com",
  "status": "confirmed",
  "created_at": "2026-12-01T10:00:00Z"
}
```

The generated `id` must be unique; any format you generate is acceptable. `status` is `confirmed` for a new booking.

### Error responses

| Status | Meaning |
| --- | --- |
| `400` | A required field is missing or empty, the email is invalid, or the slot has already started. |
| `401` | The `X-API-Key` header is missing or wrong. |
| `404` | The slot does not exist. |
| `409` | The slot already has a confirmed booking. |
| `422` | An `Idempotency-Key` was reused with a different request body. |
| `429` | The email has made more than five booking attempts in one minute. Include `Retry-After` as a whole number of seconds. |

## `GET /bookings`

Level 4. Return one person's bookings, oldest first.

Email matching must ignore case.

### Query parameters

| Name | Required | Rules |
| --- | --- | --- |
| `email` | Yes | The person's email address. |
| `limit` | No | Defaults to `10`; must be from `1` to `50`. Any other value returns `400`. |
| `cursor` | No | Pass the previous response's `next_cursor` to get the next page. |

### Response `200`

```json
{
  "bookings": [
    {
      "id": "V1StGXR8_Z5L",
      "slot_id": "s1",
      "name": "Ada Obi",
      "email": "ada@example.com",
      "status": "confirmed",
      "created_at": "2026-12-01T10:00:00Z"
    }
  ],
  "next_cursor": null
}
```

`next_cursor` is `null` on the last page.

## `GET /bookings/{id}`

Level 1. Return the booking with the given ID.

### Response `200`

Return a `Booking` object:

```json
{
  "id": "V1StGXR8_Z5L",
  "slot_id": "s1",
  "name": "Ada Obi",
  "email": "ada@example.com",
  "status": "confirmed",
  "created_at": "2026-12-01T10:00:00Z"
}
```

Return `404` with the standard error body when no booking has that ID.

## `DELETE /bookings/{id}`

Level 3. Set the booking status to `cancelled` and free its slot.

### Response `200`

Return the cancelled `Booking` object:

```json
{
  "id": "V1StGXR8_Z5L",
  "slot_id": "s1",
  "name": "Ada Obi",
  "email": "ada@example.com",
  "status": "cancelled",
  "created_at": "2026-12-01T10:00:00Z"
}
```

Return `404` when no booking has that ID. Return `409` when the booking is already cancelled.

## Shared data shapes

### Slot

```json
{
  "id": "s1",
  "provider": "Dr Ade",
  "start": "2026-12-10T09:00:00Z",
  "end": "2026-12-10T09:30:00Z"
}
```

All four fields are required. `start` and `end` use date-time strings.

### Booking

A booking contains these required fields:

- `id`: a unique string;
- `slot_id`: the booked slot ID;
- `name`: the patient's name;
- `email`: the patient's lower-case email;
- `status`: either `confirmed` or `cancelled`; and
- `created_at`: a date-time string.

## Delivery rules

- Use any language, framework, database, and host.
- Deploy the API at an HTTPS URL.
- Keep bookings available across requests. A serverless deployment must use a database.
- Keep the deployed service running and unchanged after submission until contact.

The source contract is the [Clinic Booking API OpenAPI specification](https://koyaacademy.com/assessment-api#/default).
