# Reviews Polish Design

## Goal

Make listing reviews and ratings easier to understand and safer to use without changing the review data model or introducing building-level review concepts.

## Scope

This slice keeps reviews attached to individual listings. It improves the existing listing-detail review section and hardens review ownership rules.

In scope:

- Show an average rating summary when at least one review has a rating.
- Render individual ratings with a clearer label instead of only `5/5`.
- Prevent listing owners from reviewing their own listings in the UI and server-side mutation path.
- Keep signed-out users prompted to sign in before reviewing.
- Disable create/edit/delete controls consistently while review requests are in progress.
- Add focused tests for rating summaries, rating labels, and owner review blocking.

Out of scope:

- Building or apartment-complex review models.
- Moderation, flagging, or hidden review states.
- Review helpfulness votes.
- Review replies.
- Changing existing review API paths.

## User Experience

On a listing detail page, renters see a reviews section with the review count and, when ratings exist, the average rating. Individual review cards display the author, optional rating, and body. Rating display should be text-safe and readable without relying on custom icons.

Signed-out users continue to see a prompt to sign in. Listing owners can read reviews but do not see the add-review form for their own listings. If an owner bypasses the UI and calls the API, the mutation rejects the request.

## Data Flow

The listing detail page already knows whether the current user owns the listing. It should pass that ownership state into `ReviewSection`. The review create route should pass the listing id and author id into the mutation, and the mutation should verify the listing owner before creating.

No Prisma schema change is required because `Review` already stores `listingId`, `authorId`, `body`, and optional `rating`.

## Error Handling

Owner self-review attempts should return `FORBIDDEN` with a clear message. UI failures should keep using the existing `FormFeedback` pattern and should not leave forms stuck in a submitting state.

## Testing

Add or update tests for:

- average rating calculation and display;
- individual rating label display;
- signed-in owners do not see the add-review form;
- `createReview` rejects listing owners;
- the review POST route surfaces owner blocking through existing API error handling.

Run:

- `npm test`
- `npm run lint`
- `npm run build`

