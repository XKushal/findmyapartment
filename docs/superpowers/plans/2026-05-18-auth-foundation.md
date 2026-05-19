# Auth Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add email/password authentication and protect listing write APIs with session and owner checks.

**Architecture:** Use Auth.js / NextAuth credentials with JWT sessions. Registration is a first-party API endpoint that validates input, hashes passwords, and creates users. Listing route handlers use a current-user helper instead of the temporary local-only guard.

**Tech Stack:** Next.js App Router, Auth.js / NextAuth, Prisma MongoDB, Zod, bcryptjs, Vitest.

---

## File Structure

- Modify `apps/web/prisma/schema.prisma`: add `User.passwordHash`.
- Create `apps/web/src/features/auth/schemas.ts`: registration and safe user schemas.
- Create `apps/web/src/features/auth/password.ts`: password hash/verify helpers.
- Create `apps/web/src/features/auth/users.ts`: register and lookup helpers.
- Create `apps/web/src/server/auth/auth.ts`: Auth.js config and exported handlers/auth helpers.
- Create `apps/web/src/app/api/auth/[...nextauth]/route.ts`: Auth.js route handler.
- Create `apps/web/src/app/api/auth/register/route.ts`: registration endpoint.
- Create `apps/web/src/server/auth/current-user.ts`: `requireCurrentUser`.
- Modify listing route handlers and mutations to set/check `ownerId`.
- Modify API errors and OpenAPI docs for auth errors.
- Add focused tests beside auth and listing modules.

## Tasks

- [x] Add Prisma password field and regenerate Prisma client.
- [x] Add Auth.js credentials configuration.
- [x] Add password hashing and registration helpers.
- [x] Add registration API and OpenAPI docs.
- [x] Add current-user helper and auth errors.
- [x] Replace local-only listing write guard with session ownership checks.
- [x] Update tests for registration, auth-required, forbidden, and owner writes.
- [x] Run `npm test`, `npm run lint`, and `npm run build`.
