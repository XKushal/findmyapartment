# Backend Stabilization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the backend contract, local runtime docs, and validation tests back in sync after the recent contact, upload, auth, and review slices.

**Architecture:** Keep this as a cleanup-only pass. Do not add new product behavior or frontend flows. Update OpenAPI to match existing route handlers, document the Auth.js local runtime variables that already proved necessary, and add focused schema tests around review validation and serialization.

**Tech Stack:** Next.js App Router route handlers, TypeScript, Zod, zod-to-openapi, Vitest, Auth.js, Prisma MongoDB.

---

### Task 1: OpenAPI Contract Cleanup

**Files:**
- Modify: `apps/web/src/server/api/openapi.ts`
- Modify: `apps/web/src/server/api/openapi.test.ts`

- [x] Add `/api/profile` PATCH documentation with the existing `profileUpdateBodySchema`, `UserResponse`, `400`, `401`, and `500` responses.
- [x] Add the missing `403` response to `POST /api/listings/{id}/reviews`.
- [x] Extend the OpenAPI test to assert `/api/profile` exists and the review create route documents `403`.
- [x] Run `npm test -- openapi` from `apps/web`.

### Task 2: Auth Runtime Config Documentation

**Files:**
- Modify: `apps/web/.env.example`
- Modify: `docs/architecture/001-system-design.md`

- [x] Add `AUTH_URL="http://localhost:3000"` and `AUTH_TRUST_HOST=true` to the local env example.
- [x] Update the architecture env section so local development documents `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `AUTH_TRUST_HOST`, and `NEXTAUTH_URL`.
- [x] Keep the notes focused on local runtime stability and avoid deployment-specific changes beyond the existing architecture text.

### Task 3: Review Schema Coverage

**Files:**
- Create: `apps/web/src/features/reviews/schemas.test.ts`

- [x] Test that create input trims body text and defaults missing `rating` to `null`.
- [x] Test that create input rejects ratings outside the 1-5 range.
- [x] Test that update input rejects an empty object.
- [x] Test that `serializeReview` falls back from `authorName` to author name, then author email, then `null`.
- [x] Run `npm test -- reviews/schemas`.

### Task 4: Verification

**Files:**
- No source files.

- [x] Run `npm test` from `apps/web`.
- [x] Run `npm run lint` from `apps/web`.
- [x] Run `npm run build` from `apps/web`.
- [x] Run `DATABASE_URL="mongodb://localhost:27017/allapartments" npx prisma validate` from `apps/web`.
