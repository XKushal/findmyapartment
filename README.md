# StCloudAptss

StCloudAptss is a housing marketplace for apartments, rooms, and roommate posts.
The active application lives in `apps/web`.

The project started as a campus-focused Express/EJS app, but the current product
direction is broader: help people find apartments, rooms, or roommates across the
United States.

## Active App

```bash
cd apps/web
npm install
npm run dev
```

Useful commands:

```bash
npm test
npm run lint
npm run build
npx prisma validate
```

Local environment variables are documented in `apps/web/.env.example`.

## Current Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Auth.js / NextAuth
- Prisma with MongoDB
- Zod validation
- Vitest
- OpenAPI docs at `/api-docs`

## Current Functionality

- Public listing browse and detail pages
- Apartment, room, and roommate listing types
- Authenticated listing create, edit, delete, and ownership checks
- Saved listings
- Structured contact requests
- User profile and default contact info
- Listing reviews and ratings
- Local image upload validation and preview hardening
- Backend API tests and OpenAPI documentation

## Legacy Versions

Historical Express/EJS prototype versions are archived in `legacy/`.
They are kept for reference only. Active development should happen in `apps/web`.

See `legacy/README.md` for the version history.
