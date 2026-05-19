# API Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a schema-driven API foundation with structured errors, OpenAPI JSON, Swagger UI, and read-only listing endpoints.

**Architecture:** Keep feature schemas in `src/features/listings`, API helpers in `src/server/api`, and route handlers in `src/app/api`. Use Zod as the source of truth for validation and OpenAPI generation.

**Tech Stack:** Next.js App Router, TypeScript, Prisma, Zod, `@asteasolutions/zod-to-openapi`, Swagger UI, Vitest.

---

## File Structure

- Modify `apps/web/package.json`: add `test` script.
- Create `apps/web/src/server/api/errors.ts`: API error type, factories, serialization.
- Create `apps/web/src/server/api/responses.ts`: JSON response helpers and route error wrapper.
- Create `apps/web/src/features/listings/schemas.ts`: shared Zod schemas for listing responses and route inputs.
- Create `apps/web/src/server/api/openapi.ts`: OpenAPI registry and generated document.
- Create `apps/web/src/app/api/openapi.json/route.ts`: serves generated OpenAPI JSON.
- Create `apps/web/src/app/api/listings/route.ts`: `GET /api/listings`.
- Create `apps/web/src/app/api/listings/[id]/route.ts`: `GET /api/listings/{id}`.
- Create `apps/web/src/app/api-docs/page.tsx`: Swagger UI page.
- Create `apps/web/src/app/api-docs/swagger-docs.tsx`: client Swagger UI wrapper.
- Create focused `*.test.ts` files beside API/schema modules.

## Tasks

- [x] Add Vitest script.
- [x] Write failing tests for API error serialization.
- [x] Implement API error helpers.
- [x] Write failing tests for listing schemas.
- [x] Implement listing schemas.
- [x] Write failing tests for OpenAPI generation.
- [x] Implement OpenAPI registry/document.
- [x] Add route handlers for OpenAPI JSON and listing reads.
- [x] Add Swagger UI page.
- [x] Run `npm test`, `npm run lint`, and `npm run build` from `apps/web`.
