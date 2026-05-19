# API Foundation Design

Date: 2026-05-18

## Goal

Build the first API foundation for the Next.js migration in `apps/web`: shared validation schemas, generated OpenAPI docs, consistent JSON responses, and read-only listing endpoints that prove the backend shape before adding more functionality.

## Scope

This slice covers:

- `GET /api/listings`
- `GET /api/listings/{id}`
- `GET /api/openapi.json`
- `/api-docs` Swagger UI page
- reusable API error and response helpers
- Zod schemas shared by route validation and OpenAPI generation
- focused tests for contracts that do not require a live database

This slice does not cover authenticated write endpoints, image upload, messaging, reviews, or production deployment.

## Architecture

The app remains a single Next.js App Router application. Backend HTTP endpoints live under `apps/web/src/app/api`, while reusable backend infrastructure lives under `apps/web/src/server/api`. Feature-owned listing schemas stay in `apps/web/src/features/listings` so route handlers, forms, and docs can reuse the same contracts later.

Request flow:

```text
HTTP client -> Next.js route handler -> API helper/schema -> listing query -> Prisma -> MongoDB
```

OpenAPI flow:

```text
Zod schemas + route registrations -> OpenAPI document -> /api/openapi.json -> /api-docs
```

## Error Contract

Every API error response should use:

```json
{
  "error": {
    "code": "LISTING_NOT_FOUND",
    "message": "Listing was not found.",
    "status": 404,
    "details": {}
  }
}
```

Route handlers should throw or return typed `ApiError` instances for expected failures. Unknown failures should be converted to `INTERNAL_SERVER_ERROR` with a generic public message.

## Success Contract

Collection endpoints return named payloads:

```json
{
  "data": {
    "listings": []
  }
}
```

Single-resource endpoints return:

```json
{
  "data": {
    "listing": {}
  }
}
```

## Listing API

`GET /api/listings` accepts optional query filters:

- `type`: `APARTMENT`, `ROOM`, or `ROOMMATE`

`GET /api/listings/{id}` validates `id` as a non-empty string and returns `LISTING_NOT_FOUND` when the listing is missing.

## Testing

Use Vitest for backend contract tests. Initial tests should cover:

- API error serialization
- unknown error conversion
- Zod query/path validation
- OpenAPI generation includes the listing endpoints and standard error schemas

Route handlers that touch Prisma can be smoke-tested through build/lint for now, then covered with integration tests once test database setup is defined.
