# Reviews Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make listing reviews clearer and block listing owners from reviewing their own listings.

**Architecture:** Keep the existing `Review` model and review API routes. Add small pure UI helpers for rating summary/labels, pass ownership state from the listing detail page into the review section, and enforce owner self-review blocking in the mutation layer.

**Tech Stack:** Next.js App Router, React, TypeScript, Prisma, Zod, Vitest.

---

## File Structure

- Modify `apps/web/src/features/reviews/components/review-section.tsx`: add average rating helpers, clearer rating labels, owner-aware UI, and disabled edit controls while submitting.
- Create or modify `apps/web/src/features/reviews/components/review-section.test.tsx`: test average rating, rating label, owner UI state, and review section copy.
- Modify `apps/web/src/app/listings/[id]/page.tsx`: pass `isOwner` into `ReviewSection`.
- Modify `apps/web/src/app/listings/[id]/page.test.tsx`: assert owners pass owner state and non-owners do not.
- Modify `apps/web/src/features/reviews/mutations.ts`: make `createReview` check listing ownership before create.
- Modify `apps/web/src/features/reviews/mutations.test.ts`: test owner self-review blocking and non-owner create behavior.
- Modify `apps/web/src/app/api/listings/[id]/reviews/route.test.ts`: test owner blocking is surfaced as `403`.

## Tasks

### Task 1: Review UI Summary and Owner State

**Files:**
- Modify: `apps/web/src/features/reviews/components/review-section.tsx`
- Test: `apps/web/src/features/reviews/components/review-section.test.tsx`
- Modify: `apps/web/src/app/listings/[id]/page.tsx`
- Test: `apps/web/src/app/listings/[id]/page.test.tsx`

- [ ] Write failing tests for average rating text, individual rating label text, and owner copy hiding the add-review form.
- [ ] Run `npm test -- review-section.test.tsx listings/[id]/page.test.tsx` and confirm the new tests fail.
- [ ] Export `averageReviewRating(reviews)` and `reviewRatingLabel(rating)` from `review-section.tsx`.
- [ ] Add `isOwner?: boolean` to `ReviewSectionProps`.
- [ ] Show average rating text when at least one review has a rating.
- [ ] Render individual ratings through `reviewRatingLabel`.
- [ ] Show owner copy instead of the create form when `isOwner` is true.
- [ ] Pass `isOwner={isOwner}` from the listing detail page.
- [ ] Run `npm test -- review-section.test.tsx listings/[id]/page.test.tsx` and confirm it passes.

### Task 2: Owner Self-Review Blocking

**Files:**
- Modify: `apps/web/src/features/reviews/mutations.ts`
- Test: `apps/web/src/features/reviews/mutations.test.ts`
- Test: `apps/web/src/app/api/listings/[id]/reviews/route.test.ts`

- [ ] Write failing mutation test that `createReview` throws `FORBIDDEN` when the listing owner id matches the author id.
- [ ] Write failing route test that owner self-review returns `403`.
- [ ] Run `npm test -- reviews` and confirm owner-blocking tests fail.
- [ ] In `createReview`, read the listing owner before creating the review.
- [ ] Throw `forbidden("Listing owners cannot review their own listings.")` when owner and author match.
- [ ] Keep no-database behavior returning `null`.
- [ ] Run `npm test -- reviews` and confirm it passes.

### Task 3: Full Verification

**Files:**
- Verify current branch only.

- [ ] Run `npm test`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Commit with `git commit -m "Polish listing reviews"`.

