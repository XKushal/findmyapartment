# Next.js Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first local-only Next.js foundation for AllApartments with TypeScript, React, Tailwind CSS, Prisma, MongoDB Atlas configuration, and a seedable listing data model.

**Architecture:** Create a new app at `apps/web` and leave legacy `v1` through `v12` untouched. Use Next.js App Router for pages, Prisma for MongoDB access, and environment variables for all secrets. The first slice should run locally and prove the database model without deploying.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, Prisma, MongoDB Atlas, Auth.js/NextAuth later, Vitest/Playwright later.

---

## File Structure

- Create `apps/web/`: new Next.js app.
- Create `apps/web/.env.example`: placeholder environment variables only.
- Create `apps/web/prisma/schema.prisma`: Prisma MongoDB datasource and listing-related models.
- Create `apps/web/src/lib/prisma.ts`: singleton Prisma client for server code.
- Create `apps/web/src/server/db/prisma.ts`: singleton Prisma client for backend/server code.
- Create `apps/web/src/features/listings/queries.ts`: server-side listing query helpers.
- Create `apps/web/src/features/listings/components/listing-card.tsx`: frontend listing card component.
- Create `apps/web/src/features/listings/components/listing-empty-state.tsx`: frontend empty state component.
- Create `apps/web/src/app/page.tsx`: local homepage/search entry.
- Create `apps/web/src/app/listings/page.tsx`: listing index.
- Create `apps/web/src/app/listings/[id]/page.tsx`: listing detail.
- Create `apps/web/src/app/globals.css`: Tailwind/global UI rules.
- Modify root `.gitignore`: already protects `.env*`.
- Modify docs as needed to reflect local-only development.

## Task 1: Scaffold The Web App

**Files:**
- Create: `apps/web/*`
- Create: `apps/web/.env.example`

- [ ] **Step 1: Scaffold Next.js**

Run:

```bash
npx create-next-app@latest apps/web --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Expected: `apps/web/package.json`, `apps/web/src/app/page.tsx`, and Tailwind config files exist.

- [ ] **Step 2: Add placeholder env file**

Create `apps/web/.env.example`:

```bash
DATABASE_URL="mongodb+srv://<db-user>:<db-password>@<cluster-host>/allapartments?retryWrites=true&w=majority&appName=Cluster0"
AUTH_SECRET="replace-me"
NEXTAUTH_URL="http://localhost:3000"
```

- [ ] **Step 3: Verify env files are ignored**

Run:

```bash
git check-ignore apps/web/.env.local
```

Expected: `apps/web/.env.local`

## Task 2: Add Prisma MongoDB Foundation

**Files:**
- Create: `apps/web/prisma/schema.prisma`
- Create: `apps/web/src/server/db/prisma.ts`
- Modify: `apps/web/package.json`

- [ ] **Step 1: Install Prisma dependencies**

Run:

```bash
cd apps/web && npm install prisma @prisma/client
```

Expected: Prisma packages added to `apps/web/package.json`.

- [ ] **Step 2: Create Prisma schema**

Create `apps/web/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

enum ListingType {
  APARTMENT
  ROOM
  ROOMMATE
}

enum ListingStatus {
  DRAFT
  ACTIVE
  RENTED
  ARCHIVED
}

model User {
  id        String    @id @default(auto()) @map("_id") @db.ObjectId
  email     String    @unique
  name      String?
  image     String?
  listings  Listing[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Listing {
  id              String        @id @default(auto()) @map("_id") @db.ObjectId
  title           String
  type            ListingType
  status          ListingStatus @default(ACTIVE)
  description     String
  rent            Int
  deposit         Int?
  utilitiesIncluded Boolean    @default(false)
  availableFrom   DateTime?
  leaseDuration   String?
  address         String?
  distanceToCampus String?
  bedrooms        Int?
  bathrooms       Float?
  amenities       String[]
  imageUrls       String[]
  ownerId         String?       @db.ObjectId
  owner           User?         @relation(fields: [ownerId], references: [id])
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([status])
  @@index([type])
  @@index([rent])
  @@index([availableFrom])
  @@index([ownerId])
}
```

- [ ] **Step 3: Create Prisma client helper**

Create `apps/web/src/server/db/prisma.ts`:

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

- [ ] **Step 4: Generate Prisma client**

Run:

```bash
cd apps/web && npx prisma generate
```

Expected: Prisma client generated without reading secrets from source files.

## Task 3: Add Listing Query Layer And Local UI

**Files:**
- Create: `apps/web/src/features/listings/queries.ts`
- Create: `apps/web/src/features/listings/components/listing-card.tsx`
- Create: `apps/web/src/features/listings/components/listing-empty-state.tsx`
- Modify: `apps/web/src/app/page.tsx`
- Create: `apps/web/src/app/listings/page.tsx`
- Create: `apps/web/src/app/listings/[id]/page.tsx`
- Create: `apps/web/src/app/listings/new/page.tsx`

- [ ] **Step 1: Add listing query helpers**

Create `apps/web/src/features/listings/queries.ts`:

```ts
import { ListingStatus, ListingType } from "@prisma/client";
import { prisma } from "@/server/db/prisma";

export async function getActiveListings(type?: ListingType) {
  return prisma.listing.findMany({
    where: {
      status: ListingStatus.ACTIVE,
      ...(type ? { type } : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getListingById(id: string) {
  return prisma.listing.findUnique({
    where: { id },
  });
}
```

- [ ] **Step 2: Add listing UI components**

Create `apps/web/src/features/listings/components/listing-card.tsx`:

```tsx
import Link from "next/link";
import type { Listing } from "@prisma/client";

type ListingCardProps = {
  listing: Listing;
};

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <Link
      href={`/listings/${listing.id}`}
      className="rounded-md border border-zinc-200 p-4 transition hover:border-zinc-400"
    >
      <div className="text-xs font-medium uppercase text-emerald-700">{listing.type}</div>
      <h2 className="mt-2 text-lg font-semibold text-zinc-950">{listing.title}</h2>
      <p className="mt-2 line-clamp-2 text-sm text-zinc-600">{listing.description}</p>
      <p className="mt-4 font-medium text-zinc-950">${listing.rent}/month</p>
    </Link>
  );
}
```

Create `apps/web/src/features/listings/components/listing-empty-state.tsx`:

```tsx
export function ListingEmptyState() {
  return (
    <div className="rounded-md border border-dashed border-zinc-300 p-8 text-zinc-600">
      No listings yet. Add seed data or create the first listing once posting is enabled.
    </div>
  );
}
```

- [ ] **Step 3: Replace homepage with app entry**

Update `apps/web/src/app/page.tsx`:

```tsx
import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-12">
      <section className="grid flex-1 content-center gap-8">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            AllApartments
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-normal text-zinc-950 sm:text-6xl">
            Find apartments, rooms, and roommate leads near campus.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-zinc-700">
            A local-first rental board for browsing trusted housing posts, comparing rent, and contacting posters safely.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/listings"
            className="rounded-md bg-zinc-950 px-5 py-3 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Browse listings
          </Link>
          <Link
            href="/listings/new"
            className="rounded-md border border-zinc-300 px-5 py-3 text-sm font-medium text-zinc-950 hover:bg-zinc-100"
          >
            Post a place
          </Link>
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 4: Add listing index page**

Create `apps/web/src/app/listings/page.tsx`:

```tsx
import Link from "next/link";
import { ListingCard } from "@/features/listings/components/listing-card";
import { ListingEmptyState } from "@/features/listings/components/listing-empty-state";
import { getActiveListings } from "@/features/listings/queries";

export default async function ListingsPage() {
  const listings = await getActiveListings();

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-zinc-950">Listings</h1>
          <p className="mt-2 text-zinc-600">Apartments and rooms available near campus.</p>
        </div>
        <Link className="rounded-md bg-zinc-950 px-4 py-2 text-sm text-white" href="/listings/new">
          Post listing
        </Link>
      </div>

      {listings.length === 0 ? (
        <ListingEmptyState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </main>
  );
}
```

- [ ] **Step 5: Add listing detail page**

Create `apps/web/src/app/listings/[id]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { getListingById } from "@/features/listings/queries";

type ListingDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
  const { id } = await params;
  const listing = await getListingById(id);

  if (!listing) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-6 text-sm font-medium uppercase text-emerald-700">{listing.type}</div>
      <h1 className="text-4xl font-semibold text-zinc-950">{listing.title}</h1>
      <p className="mt-4 text-xl font-medium text-zinc-950">${listing.rent}/month</p>
      <p className="mt-6 leading-8 text-zinc-700">{listing.description}</p>
    </main>
  );
}
```

- [ ] **Step 6: Add placeholder posting page**

Create `apps/web/src/app/listings/new/page.tsx`:

```tsx
import Link from "next/link";

export default function NewListingPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <p className="text-sm font-semibold uppercase tracking-normal text-emerald-700">
        Post listing
      </p>
      <h1 className="mt-3 text-3xl font-semibold text-zinc-950">
        Apartment and room posting is the next build slice.
      </h1>
      <p className="mt-4 leading-8 text-zinc-700">
        The foundation is ready for Prisma-backed listings. The posting form,
        validation, and owner-only write flow will be added after the initial
        app shell PR.
      </p>
      <Link
        href="/listings"
        className="mt-8 inline-flex rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-zinc-100"
      >
        Back to listings
      </Link>
    </main>
  );
}
```

## Task 4: Verify Local Development Safety

**Files:**
- Modify: `docs/architecture/001-system-design.md`
- Test: local commands only

- [ ] **Step 1: Run secret scan**

Run:

```bash
scripts/security-scan.sh
```

Expected: `No common secret patterns found.`

- [ ] **Step 2: Run app lint**

Run:

```bash
cd apps/web && npm run lint
```

Expected: lint completes without errors.

- [ ] **Step 3: Run local dev server**

Run:

```bash
cd apps/web && npm run dev
```

Expected: local app starts at `http://localhost:3000`.

- [ ] **Step 4: Open local app**

Open `http://localhost:3000` and `http://localhost:3000/listings`.

Expected: homepage renders; listings page renders an empty state until seed data exists.

## Self-Review

- Spec coverage: This plan covers the accepted local-only foundation, chosen stack, Prisma/MongoDB config, listing types, and apartment/room-ready model. Auth, posting forms, search filters, image uploads, and reviews are intentionally later milestones.
- Placeholder scan: Secrets are placeholder-only. The plan contains no real MongoDB URI.
- Type consistency: `ListingType`, `ListingStatus`, `Listing`, `User`, `getActiveListings`, and `getListingById` names are consistent across Prisma and app code.
