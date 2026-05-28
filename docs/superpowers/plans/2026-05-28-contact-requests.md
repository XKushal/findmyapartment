# Contact Requests Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add stored contact requests so signed-in renters can inquire on listings and owners can review received requests from `/profile`.

**Architecture:** Add a `ContactRequest` Prisma model and keep API/domain code in a new `features/contact-requests` boundary. The listing detail page renders a client form for signed-in non-owners, while `/profile` reads sent and received request summaries server-side. The first version stores inquiry data only; it does not add replies, notifications, or status transitions.

**Tech Stack:** Next.js App Router, React, TypeScript, Prisma MongoDB, Auth.js, Zod, zod-to-openapi, Vitest.

---

## File Structure

- Modify `apps/web/prisma/schema.prisma`: add `ContactMethod` enum, `ContactRequest` model, and user/listing relations.
- Create `apps/web/src/features/contact-requests/schemas.ts`: request body, response, list, serializer.
- Create `apps/web/src/features/contact-requests/mutations.ts`: create request with listing existence and owner self-contact checks.
- Create `apps/web/src/features/contact-requests/queries.ts`: read sent and received profile summaries.
- Create `apps/web/src/features/contact-requests/components/contact-request-form.tsx`: listing detail client form.
- Create `apps/web/src/features/contact-requests/components/contact-request-lists.tsx`: reusable profile sections.
- Create `apps/web/src/app/api/listings/[id]/contact-requests/route.ts`: protected create endpoint.
- Modify `apps/web/src/app/listings/[id]/page.tsx`: render the form for signed-in non-owners and keep fallback contact links.
- Modify `apps/web/src/app/profile/page.tsx`: render sent and received request sections.
- Modify `apps/web/src/server/api/errors.ts`: add `CONTACT_REQUEST_NOT_FOUND` only if needed; this plan does not need it.
- Modify `apps/web/src/server/api/openapi.ts`: register contact request schemas and route docs.
- Modify `apps/web/prisma/seed-data.mjs`: seed stable contact requests.
- Add and update focused Vitest files for schemas, mutations, queries, route, page/profile rendering, OpenAPI, and seed data.

---

### Task 1: Data Model And Schemas

**Files:**
- Modify: `apps/web/prisma/schema.prisma`
- Create: `apps/web/src/features/contact-requests/schemas.ts`
- Create: `apps/web/src/features/contact-requests/schemas.test.ts`

- [ ] **Step 1: Write failing schema tests**

Create `apps/web/src/features/contact-requests/schemas.test.ts` with tests for `contactRequestCreateBodySchema`, `contactRequestResponseSchema`, and `serializeContactRequest`.

Expected behavior:

```ts
expect(contactRequestCreateBodySchema.parse({
  message: "I would like to tour this week.",
  preferredContactMethod: "EMAIL",
  contactEmail: "renter@example.com",
  contactPhone: "",
})).toEqual({
  message: "I would like to tour this week.",
  preferredContactMethod: "EMAIL",
  contactEmail: "renter@example.com",
  contactPhone: null,
});
```

- [ ] **Step 2: Run schema tests to verify failure**

Run: `cd apps/web && npm test -- src/features/contact-requests/schemas.test.ts`

Expected: FAIL because the schemas module does not exist.

- [ ] **Step 3: Implement Prisma model and schemas**

Add `ContactMethod` enum and `ContactRequest` model to `apps/web/prisma/schema.prisma`. Add `contactRequestsSent` and `contactRequestsReceived` relations to `User`, and `contactRequests` relation to `Listing`.

Create schemas with:

- `contactMethodSchema = z.enum(["EMAIL", "PHONE", "ANY"])`
- body fields: trimmed message max 2000, preferred method default `ANY`, nullable email, nullable phone
- response fields: id, listingId, listingTitle, requesterId, requesterName, requesterEmail, ownerId, ownerName, ownerEmail, message, preferredContactMethod, contactEmail, contactPhone, createdAt, updatedAt
- `serializeContactRequest` that accepts included listing/requester/owner data and emits strings.

- [ ] **Step 4: Run schema tests to verify pass**

Run: `cd apps/web && npm test -- src/features/contact-requests/schemas.test.ts`

Expected: PASS.

---

### Task 2: Create Mutation And API Route

**Files:**
- Create: `apps/web/src/features/contact-requests/mutations.ts`
- Create: `apps/web/src/features/contact-requests/mutations.test.ts`
- Create: `apps/web/src/app/api/listings/[id]/contact-requests/route.ts`
- Create: `apps/web/src/app/api/listings/[id]/contact-requests/route.test.ts`

- [ ] **Step 1: Write failing mutation tests**

Test that `createContactRequest`:

- looks up the listing owner;
- throws `LISTING_NOT_FOUND` when listing is missing;
- throws `FORBIDDEN` when requester owns the listing;
- creates a row connecting listing, requester, and owner.

- [ ] **Step 2: Run mutation tests to verify failure**

Run: `cd apps/web && npm test -- src/features/contact-requests/mutations.test.ts`

Expected: FAIL because mutation module does not exist.

- [ ] **Step 3: Implement mutation**

Implement `createContactRequest(listingId, requesterId, input)` using Prisma. Return created request with listing/requester/owner included.

- [ ] **Step 4: Run mutation tests to verify pass**

Run: `cd apps/web && npm test -- src/features/contact-requests/mutations.test.ts`

Expected: PASS.

- [ ] **Step 5: Write failing route tests**

Route tests should mock `requireCurrentUser` and `createContactRequest`, then verify:

- `POST` returns `201` with `{ data: { contactRequest } }`;
- unauthenticated and validation failures use existing helpers through the normal route pattern.

- [ ] **Step 6: Implement route and verify**

Run: `cd apps/web && npm test -- src/app/api/listings/[id]/contact-requests/route.test.ts`

Expected: PASS.

---

### Task 3: Profile Queries And Sections

**Files:**
- Create: `apps/web/src/features/contact-requests/queries.ts`
- Create: `apps/web/src/features/contact-requests/queries.test.ts`
- Create: `apps/web/src/features/contact-requests/components/contact-request-lists.tsx`
- Create: `apps/web/src/features/contact-requests/components/contact-request-lists.test.tsx`
- Modify: `apps/web/src/app/profile/page.tsx`
- Modify: `apps/web/src/app/profile/page.test.tsx`

- [ ] **Step 1: Write failing query tests**

Test `getReceivedContactRequestsByOwner(userId)` and `getSentContactRequestsByRequester(userId)` call Prisma with owner/requester filters, include listing/requester/owner summaries, order newest first, and return `[]` when `DATABASE_URL` is missing.

- [ ] **Step 2: Implement queries and verify**

Run: `cd apps/web && npm test -- src/features/contact-requests/queries.test.ts`

Expected: PASS.

- [ ] **Step 3: Write failing component/profile tests**

Test that received and sent lists render titles, names/emails, messages, methods, and empty states. Update profile page tests to assert it requests both contact-request lists for the signed-in user.

- [ ] **Step 4: Implement profile sections and verify**

Run: `cd apps/web && npm test -- src/features/contact-requests/components/contact-request-lists.test.tsx src/app/profile/page.test.tsx`

Expected: PASS.

---

### Task 4: Listing Detail Contact Form

**Files:**
- Create: `apps/web/src/features/contact-requests/components/contact-request-form.tsx`
- Create: `apps/web/src/features/contact-requests/components/contact-request-form.test.tsx`
- Modify: `apps/web/src/app/listings/[id]/page.tsx`
- Modify: `apps/web/src/app/listings/[id]/page.test.tsx`

- [ ] **Step 1: Write failing form and page tests**

Test the form submits JSON to `/api/listings/{id}/contact-requests`, shows progress/success/error copy, and includes hidden/default contact email/phone values. Update listing detail tests to prove signed-in non-owners see the form and owners do not.

- [ ] **Step 2: Implement form and page rendering**

Use existing `FormFeedback`, `router.refresh()`, and current profile contact defaults when available.

- [ ] **Step 3: Run form/page tests**

Run: `cd apps/web && npm test -- src/features/contact-requests/components/contact-request-form.test.tsx src/app/listings/[id]/page.test.tsx`

Expected: PASS.

---

### Task 5: Seed Data And OpenAPI

**Files:**
- Modify: `apps/web/prisma/seed-data.mjs`
- Modify: `apps/web/prisma/seed-data.test.mjs`
- Modify: `apps/web/src/server/api/openapi.ts`
- Modify: `apps/web/src/server/api/openapi.test.ts`

- [ ] **Step 1: Write failing seed/OpenAPI tests**

Seed tests should assert `DEV_CONTACT_REQUESTS` has at least two stable requests and that `seedDevData` upserts them. OpenAPI tests should assert `/api/listings/{id}/contact-requests` exists and schemas include `ContactRequestCreateBody` and `ContactRequestDetailResponse`.

- [ ] **Step 2: Implement seed and OpenAPI docs**

Add `DEV_CONTACT_REQUESTS`, write-data helper, Prisma upsert loop, schema registration, and path registration.

- [ ] **Step 3: Run seed/OpenAPI tests**

Run: `cd apps/web && npm test -- prisma/seed-data.test.mjs src/server/api/openapi.test.ts`

Expected: PASS.

---

### Task 6: Generate Prisma Client And Verify

**Files:**
- Generated by command: Prisma Client under `apps/web/node_modules`.

- [ ] **Step 1: Format and generate Prisma Client**

Run:

```bash
cd apps/web && npx prisma format
cd apps/web && npx prisma generate
```

Expected: Prisma schema formats and client generation succeeds.

- [ ] **Step 2: Run full verification**

Run:

```bash
cd apps/web && npm test
cd apps/web && npm run lint
cd apps/web && npm run build
```

Expected: all pass. If the known local Turbopack helper-port sandbox issue appears, rerun build outside the sandbox.

- [ ] **Step 3: Review diff**

Run: `git status --short && git diff --stat`

Expected: only contact-request feature files, schema/seed/openapi changes, and the plan/spec are present.
