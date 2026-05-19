# StCloudAptss System Design

Date: 2026-05-18

## Purpose

StCloudAptss should become a local housing marketplace for people near campus who want to:

- post apartments, rooms, or roommate opportunities;
- search and filter available rentals;
- contact the poster safely;
- review apartment experiences when useful;
- manage their own posts and comments.

The old codebase is a useful prototype, but it should be treated as a product sketch rather than a production foundation. The strongest path is to keep the domain ideas, learn from the latest working version, and rebuild the final app with a modern stack.

## Existing Version Review

| Version | Role in project history | Main functionality | Tech stack notes | Keep or learn from |
| --- | --- | --- | --- | --- |
| `v1` | First prototype | Static in-memory apartment list, create form | Express, EJS, body-parser | Learn route naming and first UI idea only |
| `v2` | First database version | Apartment CRUD basics, show page | Express, EJS, Mongoose, local MongoDB `StCloudApts` | Learn first Mongo schema |
| `v3` / `v4` | Model and seed refactor | Apartment detail page with comments populated | Express, EJS, Mongoose models, seed script | Learn model separation and comments relationship |
| `v5` | Better structure | Apartment routes grouped in folders, comments creation, static CSS | Express, EJS, Mongoose | Learn view organization |
| `v6` | Authentication added | Register, login, logout, protected comments | Express sessions, Passport Local, passport-local-mongoose | Learn auth flow, but do not reuse directly |
| `v7` | Route refactor | Routes split into `routes/index`, `routes/apartments`, `routes/comments` | Express Router | Learn route/module boundaries |
| `v8` | Comment ownership | Comments store author id and username | Passport, Mongoose references | Keep concept of owned user content |
| `v9` | Apartment ownership | Users must log in to post apartments; posts store author | Passport, Mongoose references | Keep concept of owned listings |
| `v10` | Edit/delete authorization | CRUD for apartments and comments with owner checks | Method override, middleware module | Strong old baseline for core marketplace behavior |
| `v11` | Review/rating experiment | Adds review model, star ratings, review pages | connect-flash, review routes/model | Keep feature idea, but code has bugs |
| `v12` | Most polished stable version | Auth, apartment CRUD, comment CRUD, ownership, flash messages, improved landing page | Express, EJS, Mongoose, Passport, Bootstrap 3 | Best stable baseline |

## Which Version Looks Most Final?

`v12` looks like the most final stable version. It has the latest landing page work, flash messages, authentication, ownership checks, apartment CRUD, comment CRUD, and route organization.

`v11` has the most advanced feature set because it adds reviews and ratings, but it is not the cleanest final version. It contains several leftover tutorial naming mistakes:

- delete route uses `middleware.checkCampgroundOwnership`, but the middleware exports `checkAptOwner`;
- some review code uses `reviews`, while the schema field is named `review`;
- some redirects still point to `/campgrounds`;
- review association uses `ref: "apartments"` while the apartment model is named `"Apartment"`.

Decision: use `v12` as the behavioral baseline and bring the `v11` review/rating concept forward only after correcting the data model.

## Current Functional Coverage

The old app already covers:

- public landing page;
- apartment listing index;
- apartment detail page;
- create, edit, and delete apartment posts;
- user registration, login, logout;
- session-based auth;
- comments on apartment posts;
- owner-only edit/delete for apartments and comments;
- flash messages for feedback;
- local MongoDB persistence through Mongoose.

The old app does not yet cover the full marketplace goal:

- room listings as a first-class listing type;
- roommate posts/profiles;
- structured search and filters;
- price, availability, lease terms, campus distance, address, amenities;
- image upload/storage;
- messaging or contact-request workflow;
- moderation/reporting;
- saved listings;
- deployment-ready environment config;
- production database config;
- tests;
- modern security defaults.

## Existing Tech Stack

The project uses:

- Node.js;
- Express 4;
- EJS server-rendered templates;
- Bootstrap 3;
- MongoDB through Mongoose 5;
- Passport Local with `passport-local-mongoose`;
- Express sessions;
- `connect-flash`;
- `method-override`;
- old Heroku-style `process.env.PORT` / `process.env.IP` server startup.

The database was MongoDB. The app points to local databases named `StCloudApts`, `Apts_4`, and mostly `Apts_6`.

## Recommended Final Architecture

Chosen stack:

- Frontend and backend: Next.js with App Router.
- UI runtime: React.
- Language: TypeScript.
- Database: MongoDB Atlas.
- ORM/data layer: Prisma.
- Auth: Auth.js / NextAuth.
- Styling: Tailwind CSS plus a small component system.
- Images: Vercel Blob, Cloudinary, or S3-compatible storage.
- Hosting: Vercel.
- Validation: Zod schemas shared between forms and server actions/API routes.
- Testing: Vitest for domain utilities and Playwright for key user flows.

This keeps the project close to the original JavaScript/MongoDB mental model, while making deployment to Vercel and future development much easier.

## Core Product Modules

### Listings

A listing should represent anything rentable or searchable:

- full apartment;
- private room;
- shared room;
- roommate wanted;
- sublease.

Core fields:

- title;
- listing type;
- description;
- rent amount;
- deposit;
- utilities included flag;
- availability date;
- lease duration;
- address or approximate location;
- distance to campus;
- bedroom/bathroom counts where relevant;
- amenities;
- image gallery;
- owner id;
- status: draft, active, rented, archived.

### Search

Search should support:

- keyword search;
- listing type;
- min/max rent;
- availability date;
- bedroom count;
- roommate-friendly flag;
- distance/location filters;
- sort by newest, rent, rating, or distance.

For the first version, MongoDB indexes are enough. Later, add Atlas Search if keyword/location search needs to feel better.

### Users and Profiles

Users need:

- account identity;
- display name;
- contact preference;
- optional student/campus affiliation fields;
- owned listings;
- saved listings;
- moderation state if needed.

Roommate matching can start as profile fields rather than a complex algorithm:

- budget;
- move-in date;
- cleanliness preference;
- sleep schedule;
- pets;
- smoking preference;
- gender preference if the user chooses to disclose it;
- short bio.

### Comments, Reviews, and Contact

Keep comments only if public discussion is useful. A housing marketplace often works better with:

- private contact request;
- optional public questions;
- reviews for apartment/building experience;
- report listing.

Reviews should belong to either a building/apartment complex or a completed rental experience, not necessarily to every individual listing. This avoids fake or duplicate reviews on short-lived posts.

## Frontend And Backend Structure

The new app will live in `apps/web`. Next.js will host both frontend routes and backend/server logic, but the folder structure should make the boundary obvious.

```text
apps/web/
  prisma/
    schema.prisma
  src/
    app/                    # Frontend routes and route handlers
      page.tsx
      listings/
        page.tsx
        [id]/
          page.tsx
        new/
          page.tsx
      api/                  # Backend HTTP endpoints if server actions are not enough
    components/             # Reusable frontend UI components
      listings/
      layout/
      ui/
    features/               # Feature modules that pair UI and server interactions
      listings/
        components/
        actions.ts          # Server actions only
        queries.ts          # Server-side read functions
        validation.ts       # Zod schemas shared by forms/actions
    server/                 # Backend-only infrastructure
      db/
        prisma.ts
      auth/
      repositories/
    lib/                    # Shared safe utilities with no secrets
```

Rules:

- Client components must not import Prisma, database repositories, or secret environment variables.
- Backend code lives in `src/server`, server actions, or route handlers.
- Feature folders own their UI, validation, and server interaction contracts.
- Shared validation schemas can be reused by frontend forms and backend actions.
- Use environment variables for secrets; never hard-code database URLs or auth secrets.

High-level flow:

```text
Browser UI -> Next.js page/component -> server action or route handler -> repository/query -> Prisma -> MongoDB Atlas
```

This keeps frontend interactions seamless while preserving a clear backend boundary inside the same Next.js app.

## Proposed Data Model

Collections:

- `users`
- `listings`
- `listingImages`
- `savedListings`
- `contactRequests`
- `comments` or `questions`
- `reviews`
- `reports`

Important relationships:

- `Listing.ownerId -> User`
- `Listing.images[] -> ListingImage`
- `ContactRequest.listingId -> Listing`
- `ContactRequest.senderId -> User`
- `Review.authorId -> User`
- `Review.subjectId -> Listing or Building`

Initial MongoDB indexes:

- `listings.status`
- `listings.ownerId`
- `listings.type`
- `listings.rent`
- `listings.availableFrom`
- compound index on `status`, `type`, `rent`, `availableFrom`
- text index on `title`, `description`, `address`, `amenities`

## Vercel Deployment Plan

Use Vercel for the Next.js app.

Environment variables:

- `DATABASE_URL`
- `AUTH_SECRET`
- `NEXT_PUBLIC_APP_URL`
- image storage credentials if using Cloudinary/Vercel Blob

MongoDB Atlas should replace local MongoDB. For local development, use either:

- a local Docker MongoDB instance; or
- a separate MongoDB Atlas development database.

## MongoDB Atlas Setup Checklist

Use MongoDB Atlas as the source database for local development and Vercel production.

Required setup:

1. Use the Atlas project named `AllApartments`.
2. Create a free or small shared cluster while the app is in development.
3. Create a database user with a strong password. Do not use the Atlas account login as the application database user.
4. Allow network access:
   - for local development, add the current local IP address;
   - for Vercel production, use the deployment platform's recommended outbound access approach. During early development, `0.0.0.0/0` can unblock testing, but it should be paired with a strong database password and least-privilege database user.
5. Copy the Atlas application connection string.
6. Add the real database name to the connection string path, for example `allapartments`.
7. Store it locally in `apps/web/.env.local` as `DATABASE_URL`.
8. Store the same value in Vercel project environment variables for Preview and Production when the app is deployed.

If the database username or password contains special characters such as `@`, percent-encode them before placing them in the URI. For example, `@` becomes `%40`.

Expected local environment variables:

```bash
DATABASE_URL="mongodb+srv://<db-user>:<db-password>@<cluster-host>/allapartments?retryWrites=true&w=majority&appName=Cluster0"
AUTH_SECRET="<generated-secret>"
NEXTAUTH_URL="http://localhost:3000"
```

Prisma datasource:

```prisma
datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}
```

Important Prisma/MongoDB note: Prisma with MongoDB uses `prisma db push` rather than normal SQL-style migration files. Schema changes should be reviewed carefully before pushing to a shared database.

## Branching Plan

Suggested branch structure:

- `main`: stable documentation and deployable app.
- `codex/architecture-docs`: architecture and migration planning.
- `codex/nextjs-foundation`: new Next.js app shell, styling, auth decision.
- `codex/data-model`: MongoDB schemas, validation, seed data.
- `codex/listings-core`: create/list/search/detail listing flows.
- `codex/auth-profiles`: user auth and profile pages.
- `codex/contact-flow`: contact requests or private messaging starter.
- `codex/reviews-ratings`: corrected version of the `v11` review concept.
- `codex/deployment-vercel`: production environment, Vercel, database setup.

Each branch should be small enough to review and merge independently.

## Migration Strategy

Do not directly mutate the old version folders. Keep them as historical references.

Long-term repo layout after migration:

```text
legacy/
  v1/
  ...
  v12/
apps/
  web/
docs/
  architecture/
```

If we want to preserve the current folder names for now, we can leave `v1` through `v12` in place and create the new app in:

```text
apps/web
```

Later, move old versions into `legacy/` in a cleanup branch.

Branching decision: keep the current `v1` through `v12` folders in place while the new app is being built. Once the migrated app is working, move the old version folders on a dedicated `release/legacy` branch so history stays available without crowding the active application.

## Architecture Decision

Use `v12` as the stable baseline for old behavior.

Reuse concepts from:

- `v10`: owner-based edit/delete for listings and comments;
- `v11`: ratings/reviews concept after fixing model and route naming;
- `v12`: final landing page, flash-feedback idea, and most stable route set.

Build the final product as a new modern app rather than continuing inside `v12`.

Recommended final stack:

- Next.js + React + TypeScript on Vercel;
- MongoDB Atlas;
- Prisma;
- Auth.js/NextAuth;
- Tailwind CSS;
- Vercel Blob or Cloudinary for images.

## Open Decisions

1. Messaging: start with contact requests, then add real messaging only if needed.
2. Reviews: review apartment buildings/complexes or individual listings.
3. Search: start with MongoDB indexes, upgrade to Atlas Search later.
4. Image storage: choose Vercel Blob, Cloudinary, or S3-compatible storage.

## First Implementation Milestones

1. Create `apps/web` as a Next.js TypeScript app.
2. Add base layout, navigation, and listing index/detail pages with seed data.
3. Add MongoDB connection and listing schema.
4. Add create/edit/delete listing flows with auth.
5. Add search filters.
6. Add image upload.
7. Add contact request workflow.
8. Add reviews/ratings after the listing model is stable.

## Immediate Next Step

Architecture decisions now accepted:

- use Next.js, React, TypeScript, and Tailwind CSS;
- use MongoDB Atlas with Prisma;
- use Auth.js/NextAuth;
- model apartment, room, and roommate listing types from day one;
- ship apartment and room posting first.

My recommendation for the first build is:

- Next.js + TypeScript;
- React;
- Tailwind CSS;
- MongoDB Atlas + Prisma;
- Auth.js/NextAuth;
- include listing types for apartment, room, and roommate from the data model on day one, but ship apartment/room posting first.

Accepted first release scope:

- model listing types for apartment, room, and roommate from day one;
- ship apartment and room posting first;
- keep roommate posting/profile flows as the next product slice after listing CRUD/search is stable.
