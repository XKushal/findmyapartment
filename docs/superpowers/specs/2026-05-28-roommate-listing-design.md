# Roommate Listing Design

## Goal

Make roommate posts feel first-class in the existing listing system without adding a separate roommate profile product. A roommate post remains a `Listing` with `type = ROOMMATE`, but it can carry roommate-specific details that apartment and room posts do not need.

## Scope

This slice covers roommate-specific listing creation, editing, display, filtering, API validation, OpenAPI documentation, and local seed data. It does not add a standalone roommate profile page, renter preference storage on `/profile`, matching algorithms, messaging, or notification workflows.

## Product Boundaries

`/profile` stays focused on account basics, default contact information, owned listings, and saved listings. Roommate preferences belong to the roommate listing itself and to `/listings` discovery filters.

Roommate posts should support the existing owner workflow:

- create a listing as a signed-in owner;
- edit or archive only owned listings;
- expose contact actions to non-owners;
- allow renters to save roommate posts;
- support reviews only through the existing listing review model.

## Data Model

Reuse the `Listing` model and add optional fields that are meaningful for roommate posts:

- `roommateCount`: how many roommates the poster is looking for;
- `preferredGender`: optional free-text preference, such as `No preference`;
- `lifestyle`: short household rhythm or vibe;
- `cleanliness`: free-text expectation;
- `smokingPolicy`: free-text expectation;
- `roommatePreferences`: general expectations or compatibility notes.

These fields remain optional so existing apartment and room listings continue to work unchanged. They can be stored on any listing record, but the UI and copy only surface them for `ROOMMATE` listings.

## UI Behavior

The create/edit form keeps the existing listing fields and conditionally reveals a "Roommate fit" section when Home type is `Roommate lead`. The section collects the optional roommate fields above and submits them with the normal listing payload.

The listing detail page shows a roommate-specific section for `ROOMMATE` listings when any roommate field is present. Listing cards should make roommate posts scannable with the existing type badge and a short compatibility cue when available.

The listing filter form keeps the current Home type dropdown and adds no new complex filter controls in this slice. Users can already filter to `ROOMMATE`; deeper roommate matching can follow once real data clarifies which filters matter.

## API And Validation

The shared listing schemas accept optional roommate fields on create, update, and API responses. Payload parsing should trim text and treat blank optional roommate fields as omitted, matching existing form behavior.

OpenAPI docs should include the new fields in listing create/update/response schemas. Existing listing routes remain the only API surface for roommate posts.

## Seed Data

Local seed data should include at least one `ROOMMATE` listing with roommate-specific fields populated so the UI can be smoke-tested without manual setup.

## Testing

Use test-first changes for the behavior surface:

- schema tests for optional roommate fields and blank-value normalization;
- form payload tests for roommate field parsing;
- create/edit form tests for conditional roommate fields;
- listing detail/card tests for roommate-specific rendering;
- seed data tests proving a populated roommate listing exists;
- OpenAPI tests confirming the fields are documented.

Full verification before completion should include `npm test`, `npm run lint`, and `npm run build` from `apps/web`.
