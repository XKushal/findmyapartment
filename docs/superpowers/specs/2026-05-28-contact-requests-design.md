# Contact Requests Design

## Goal

Add a structured in-app inquiry workflow so renters can express interest in a listing and owners can review those requests from the app. This turns listing demand into app-owned data while keeping the first version smaller than messaging or notification systems.

## Scope

This slice covers stored contact requests, a protected create endpoint, listing-detail submission UI, profile sections for sent and received requests, local seed data, and OpenAPI documentation. It does not add real-time chat, email delivery, owner replies, moderation, or a multi-step request status workflow.

## Product Behavior

Signed-in non-owners can submit a contact request from a listing detail page. The form collects:

- message;
- preferred contact method;
- contact email snapshot;
- contact phone snapshot.

The request is tied to the listing, requester, and listing owner. Owners cannot send requests to their own listings. Signed-out users see the existing sign-in path.

The existing email and phone actions can remain as fallback when listing contact info exists, but the in-app form becomes the primary signed-in flow.

## Profile Views

`/profile` gets two lightweight sections:

- **Requests received** for listing owners, grouped as a simple list with listing title, requester name/email, message, preferred contact method, and submitted date.
- **Requests sent** for renters, showing listing title, owner name/email, message, preferred contact method, and submitted date.

This keeps `/profile` as account basics plus owned activity, not renter preference storage.

## Data Model

Add a `ContactRequest` model with:

- `id`;
- `listingId`;
- `listing` relation;
- `requesterId`;
- `requester` relation;
- `ownerId`;
- `owner` relation;
- `message`;
- `preferredContactMethod`;
- `contactEmail`;
- `contactPhone`;
- `createdAt`;
- `updatedAt`.

`preferredContactMethod` should be an enum with `EMAIL`, `PHONE`, and `ANY`. Contact email and phone are snapshots so requests remain understandable even if a user later edits profile defaults.

## API And Validation

Add a protected `POST /api/listings/{id}/contact-requests` route. It validates the message, preferred method, and contact fields, checks the listing exists, checks the user is signed in, rejects owners contacting themselves, and stores the request.

Add protected read helpers for profile usage. A separate public list endpoint is not needed in this slice; profile pages can read server-side data using feature queries.

OpenAPI should document the create request body and response envelope.

## Error Handling

Use the existing API error envelope. Expected errors:

- `AUTH_REQUIRED` for signed-out users;
- `LISTING_NOT_FOUND` for missing listings;
- `FORBIDDEN` when an owner contacts their own listing;
- validation errors for missing message or invalid contact values.

## Seed Data

Seed at least two contact requests:

- one request from the renter account to an apartment or room listing;
- one request to the roommate listing.

The seed should be idempotent and use stable IDs like the current user/listing/review/saved-listing fixtures.

## Testing

Use test-first changes for:

- Zod schemas for contact request create and response payloads;
- mutation behavior for create, auth/owner checks, and stable serialization;
- profile query behavior for received and sent requests;
- listing detail rendering of the contact form for signed-in non-owners;
- profile rendering of sent and received request sections;
- API route behavior and OpenAPI docs;
- seed data shape and Prisma upserts.

Full verification before completion should include `npm test`, `npm run lint`, and `npm run build` from `apps/web`.
