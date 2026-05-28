# Roommate Listing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `ROOMMATE` listings first-class by adding optional roommate-specific fields to listing APIs, forms, detail/card UI, OpenAPI docs, and seed data.

**Architecture:** Keep roommate posts inside the existing `Listing` model instead of creating a separate roommate profile system. Add optional fields end-to-end and surface them only for `ROOMMATE` listings in the UI. Preserve existing apartment/room behavior by defaulting blank optional values to `null`.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, Prisma MongoDB, Zod, zod-to-openapi, Vitest.

---

## File Structure

- Modify `apps/web/prisma/schema.prisma`: add optional roommate fields to `Listing`.
- Modify `apps/web/src/features/listings/schemas.ts`: add roommate fields to create/update/response schemas, API serialization, and write data conversion.
- Modify `apps/web/src/features/listings/schemas.test.ts`: prove create/response schemas accept roommate fields and blank-like optional handling remains safe.
- Modify `apps/web/src/features/listings/form-payload.ts`: parse roommate form fields into create/update payloads.
- Modify `apps/web/src/features/listings/form-payload.test.ts`: prove trimming and blank normalization for roommate fields.
- Modify `apps/web/src/features/listings/components/listing-create-form.tsx`: show a conditional roommate section when `type` is `ROOMMATE`; include edit defaults.
- Create `apps/web/src/features/listings/components/listing-create-form.test.tsx`: prove create/edit forms render roommate fields correctly.
- Modify `apps/web/src/features/listings/components/listing-card.tsx`: show a compact roommate compatibility cue when present.
- Create `apps/web/src/features/listings/components/listing-card.test.tsx`: prove roommate cue rendering is type-scoped.
- Modify `apps/web/src/app/listings/[id]/page.tsx`: show a roommate fit section on detail pages for roommate listings with any roommate fields.
- Modify `apps/web/src/app/listings/[id]/page.test.tsx`: prove roommate details render only for roommate listings.
- Modify `apps/web/prisma/seed-data.mjs`: populate roommate fields on the seeded roommate lead and include them in listing upserts.
- Modify `apps/web/prisma/seed-data.test.mjs`: prove seed data includes a populated roommate listing and write data includes roommate fields.
- Modify `apps/web/src/server/api/openapi.test.ts`: prove OpenAPI schemas document the roommate fields.
- Run `npx prisma generate`, `npm test`, `npm run lint`, and `npm run build` from `apps/web`.

---

### Task 1: Add Roommate Fields To Schemas And Prisma

**Files:**
- Modify: `apps/web/prisma/schema.prisma`
- Modify: `apps/web/src/features/listings/schemas.ts`
- Modify: `apps/web/src/features/listings/schemas.test.ts`

- [ ] **Step 1: Write failing schema tests**

Add tests in `apps/web/src/features/listings/schemas.test.ts`:

```ts
it("accepts roommate-specific fields on listing responses", () => {
  const parsed = listingResponseSchema.parse({
    id: "507f1f77bcf86cd799439011",
    title: "Looking for a fall roommate",
    type: "ROOMMATE",
    status: "ACTIVE",
    description: "Shared lease near campus.",
    rent: 575,
    deposit: null,
    utilitiesIncluded: true,
    availableFrom: null,
    leaseDuration: "Fall semester",
    address: null,
    distanceToCampus: "0.8 miles",
    contactEmail: "poster@example.com",
    contactPhone: null,
    bedrooms: 1,
    bathrooms: 1,
    petPolicy: "UNKNOWN",
    amenities: ["Bus route"],
    imageUrls: [],
    roommateCount: 1,
    preferredGender: "No preference",
    lifestyle: "Quiet weekdays, social weekends",
    cleanliness: "Shared chores weekly",
    smokingPolicy: "No smoking",
    roommatePreferences: "Graduate students preferred",
    ownerId: null,
    createdAt: "2026-05-18T12:00:00.000Z",
    updatedAt: "2026-05-18T12:00:00.000Z",
  });

  expect(parsed.roommateCount).toBe(1);
  expect(parsed.lifestyle).toBe("Quiet weekdays, social weekends");
});

it("accepts optional roommate fields for listing writes", () => {
  const parsed = listingCreateBodySchema.safeParse({
    title: "Looking for a fall roommate",
    type: "ROOMMATE",
    description: "Shared lease near campus.",
    rent: 575,
    roommateCount: 1,
    preferredGender: "No preference",
    lifestyle: "Quiet weekdays, social weekends",
    cleanliness: "Shared chores weekly",
    smokingPolicy: "No smoking",
    roommatePreferences: "Graduate students preferred",
  });

  expect(parsed.success).toBe(true);
  expect(parsed.success ? parsed.data.roommateCount : null).toBe(1);
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `cd apps/web && npm test -- src/features/listings/schemas.test.ts`

Expected: FAIL because `roommateCount`, `preferredGender`, `lifestyle`, `cleanliness`, `smokingPolicy`, and `roommatePreferences` are not yet in the schemas.

- [ ] **Step 3: Implement minimal schema and model changes**

Add to the `Listing` model in `apps/web/prisma/schema.prisma`:

```prisma
  roommateCount       Int?
  preferredGender     String?
  lifestyle           String?
  cleanliness         String?
  smokingPolicy       String?
  roommatePreferences String?
```

Add reusable schemas and include fields in response/create/update schemas in `apps/web/src/features/listings/schemas.ts`:

```ts
const nullableTrimmedStringSchema = z.string().trim().min(1).nullable();
const nullableRoommateCountSchema = z.number().int().positive().nullable();

const roommateFieldsSchema = {
  roommateCount: nullableRoommateCountSchema.default(null),
  preferredGender: nullableTrimmedStringSchema.default(null),
  lifestyle: nullableTrimmedStringSchema.default(null),
  cleanliness: nullableTrimmedStringSchema.default(null),
  smokingPolicy: nullableTrimmedStringSchema.default(null),
  roommatePreferences: nullableTrimmedStringSchema.default(null),
};
```

Response fields should be nullable without defaults. Create fields should use defaults. Update fields should be nullable and optional.

Extend `ListingForApi`, `serializeListing`, and `toListingWriteData` so these fields pass through and default to `null` when missing.

- [ ] **Step 4: Run schema tests to verify pass**

Run: `cd apps/web && npm test -- src/features/listings/schemas.test.ts`

Expected: PASS.

---

### Task 2: Parse Roommate Fields From Listing Forms

**Files:**
- Modify: `apps/web/src/features/listings/form-payload.ts`
- Modify: `apps/web/src/features/listings/form-payload.test.ts`

- [ ] **Step 1: Write failing form payload test**

Add to `apps/web/src/features/listings/form-payload.test.ts`:

```ts
it("normalizes roommate form fields for the create endpoint", () => {
  const formData = new FormData();
  formData.set("title", "  Fall roommate lead  ");
  formData.set("type", "ROOMMATE");
  formData.set("description", "Looking for one roommate");
  formData.set("rent", "575");
  formData.set("roommateCount", "1");
  formData.set("preferredGender", " No preference ");
  formData.set("lifestyle", " Quiet weekdays ");
  formData.set("cleanliness", "");
  formData.set("smokingPolicy", " No smoking ");
  formData.set("roommatePreferences", " Graduate students preferred ");

  expect(createListingPayloadFromFormData(formData)).toEqual(
    expect.objectContaining({
      type: "ROOMMATE",
      roommateCount: 1,
      preferredGender: "No preference",
      lifestyle: "Quiet weekdays",
      cleanliness: null,
      smokingPolicy: "No smoking",
      roommatePreferences: "Graduate students preferred",
    }),
  );
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `cd apps/web && npm test -- src/features/listings/form-payload.test.ts`

Expected: FAIL because the returned payload does not include roommate fields.

- [ ] **Step 3: Implement form parsing**

In `createListingPayloadFromFormData`, add:

```ts
    roommateCount: nullableNumberValue(formData, "roommateCount"),
    preferredGender: nullableStringValue(formData, "preferredGender"),
    lifestyle: nullableStringValue(formData, "lifestyle"),
    cleanliness: nullableStringValue(formData, "cleanliness"),
    smokingPolicy: nullableStringValue(formData, "smokingPolicy"),
    roommatePreferences: nullableStringValue(formData, "roommatePreferences"),
```

- [ ] **Step 4: Run form payload tests**

Run: `cd apps/web && npm test -- src/features/listings/form-payload.test.ts`

Expected: PASS.

---

### Task 3: Render Roommate Fields In Listing Forms

**Files:**
- Modify: `apps/web/src/features/listings/components/listing-create-form.tsx`
- Create: `apps/web/src/features/listings/components/listing-create-form.test.tsx`

- [ ] **Step 1: Write failing component tests**

Create `apps/web/src/features/listings/components/listing-create-form.test.tsx` with tests that render `ListingCreateForm` directly, mock `next/navigation`, and recursively search rendered output for labels:

```ts
it("shows roommate fit fields for roommate listings in edit mode", () => {
  const form = ListingCreateForm({
    mode: "edit",
    listing: {
      id: "507f1f77bcf86cd799439011",
      title: "Fall roommate lead",
      type: "ROOMMATE",
      description: "Looking for one roommate",
      rent: 575,
      deposit: null,
      utilitiesIncluded: true,
      availableFrom: null,
      leaseDuration: "Fall semester",
      address: null,
      distanceToCampus: "0.8 miles",
      contactEmail: "poster@example.com",
      contactPhone: null,
      bedrooms: 1,
      bathrooms: 1,
      petPolicy: "UNKNOWN",
      amenities: [],
      imageUrls: [],
      roommateCount: 1,
      preferredGender: "No preference",
      lifestyle: "Quiet weekdays",
      cleanliness: "Shared chores weekly",
      smokingPolicy: "No smoking",
      roommatePreferences: "Graduate students preferred",
    },
  });

  expect(includesText(form, "Roommate fit")).toBe(true);
  expect(includesText(form, "Preferred gender")).toBe(true);
  expect(includesText(form, "Graduate students preferred")).toBe(true);
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `cd apps/web && npm test -- src/features/listings/components/listing-create-form.test.tsx`

Expected: FAIL because `Roommate fit` fields do not exist.

- [ ] **Step 3: Implement form UI**

Extend `ListingFormValue` with roommate fields. Track selected type with:

```ts
const [selectedType, setSelectedType] = useState<ListingCreateInput["type"]>(
  listing?.type ?? "APARTMENT",
);
const isRoommateListing = selectedType === "ROOMMATE";
```

Add `onChange={(event) => setSelectedType(event.target.value as ListingCreateInput["type"])}` to the type select.

Render this section before amenities:

```tsx
{isRoommateListing ? (
  <section className="grid gap-4 rounded-md border border-zinc-200 p-4">
    <div>
      <h2 className="text-sm font-semibold text-zinc-950">Roommate fit</h2>
      <p className="mt-1 text-sm text-zinc-600">
        Share compatibility details for people comparing roommate leads.
      </p>
    </div>
    {/* inputs: roommateCount, preferredGender, lifestyle, cleanliness, smokingPolicy, roommatePreferences */}
  </section>
) : null}
```

Use existing input/textarea classes and names exactly matching the payload fields.

- [ ] **Step 4: Run component test**

Run: `cd apps/web && npm test -- src/features/listings/components/listing-create-form.test.tsx`

Expected: PASS.

---

### Task 4: Render Roommate Details On Cards And Detail Pages

**Files:**
- Modify: `apps/web/src/features/listings/components/listing-card.tsx`
- Create: `apps/web/src/features/listings/components/listing-card.test.tsx`
- Modify: `apps/web/src/app/listings/[id]/page.tsx`
- Modify: `apps/web/src/app/listings/[id]/page.test.tsx`

- [ ] **Step 1: Write failing render tests**

Add tests proving:

```ts
expect(includesText(card, "Quiet weekdays")).toBe(true);
expect(includesText(page, "Roommate fit")).toBe(true);
expect(includesText(page, "Shared chores weekly")).toBe(true);
```

Use a `ROOMMATE` listing with `lifestyle` and `cleanliness` populated.

- [ ] **Step 2: Run render tests to verify failure**

Run: `cd apps/web && npm test -- src/features/listings/components/listing-card.test.tsx src/app/listings/[id]/page.test.tsx`

Expected: FAIL because the roommate cue and detail section do not exist.

- [ ] **Step 3: Implement card and detail rendering**

In `listing-card.tsx`, compute:

```ts
const roommateCue =
  listing.type === "ROOMMATE"
    ? listing.lifestyle ?? listing.roommatePreferences ?? listing.preferredGender
    : null;
```

Render the cue below the description when present.

In `page.tsx`, create a `roommateDetails` array from roommate fields, filter empty values, and render a `Roommate fit` section only when `listing.type === "ROOMMATE"` and the array has entries.

- [ ] **Step 4: Run render tests**

Run: `cd apps/web && npm test -- src/features/listings/components/listing-card.test.tsx src/app/listings/[id]/page.test.tsx`

Expected: PASS.

---

### Task 5: Seed And OpenAPI Coverage

**Files:**
- Modify: `apps/web/prisma/seed-data.mjs`
- Modify: `apps/web/prisma/seed-data.test.mjs`
- Modify: `apps/web/src/server/api/openapi.test.ts`

- [ ] **Step 1: Write failing seed and OpenAPI tests**

In seed tests, assert the roommate seed has `roommateCount`, `lifestyle`, and `roommatePreferences`. In OpenAPI tests, assert `ListingCreateBody`, `ListingUpdateBody`, and `ListingDetailResponse` schemas include `roommatePreferences`.

- [ ] **Step 2: Run tests to verify failure**

Run: `cd apps/web && npm test -- prisma/seed-data.test.mjs src/server/api/openapi.test.ts`

Expected: FAIL because the seed write data and OpenAPI schema do not expose all fields yet.

- [ ] **Step 3: Implement seed and OpenAPI support**

Populate the existing seeded roommate listing with:

```js
roommateCount: 1,
preferredGender: "No preference",
lifestyle: "Quiet weeknights, friendly shared meals",
cleanliness: "Shared chores weekly",
smokingPolicy: "No smoking",
roommatePreferences: "Student or recent graduate comfortable with a shared lease.",
```

Add the same fields to `listingWriteData`.

The OpenAPI test should pass once the listing Zod schemas include the fields and are registered.

- [ ] **Step 4: Run seed and OpenAPI tests**

Run: `cd apps/web && npm test -- prisma/seed-data.test.mjs src/server/api/openapi.test.ts`

Expected: PASS.

---

### Task 6: Generate Prisma Client And Verify

**Files:**
- Generated by command: `apps/web/node_modules/.prisma/client/*`
- No manual source edits.

- [ ] **Step 1: Generate Prisma client**

Run: `cd apps/web && npx prisma generate`

Expected: Prisma Client generated successfully for the updated schema.

- [ ] **Step 2: Run full tests**

Run: `cd apps/web && npm test`

Expected: all tests pass.

- [ ] **Step 3: Run lint**

Run: `cd apps/web && npm run lint`

Expected: lint passes.

- [ ] **Step 4: Run build**

Run: `cd apps/web && npm run build`

Expected: build passes. If the known Turbopack sandbox helper port issue appears, rerun with escalation.

- [ ] **Step 5: Review diff**

Run: `git status --short && git diff --stat`

Expected: only roommate-listing source, spec, and plan files are changed.
