# Image Upload Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden local listing image uploads with MIME, count, and size validation without adding external storage.

**Architecture:** Keep the existing data URL storage model, but centralize image limits in listing schemas and listing form helpers. The API schema remains the source of truth, while the client rejects bad files before reading them into memory.

**Tech Stack:** Next.js, React, TypeScript, Zod, Vitest.

---

## File Structure

- Modify `apps/web/src/features/listings/schemas.ts` to export image limits and enforce valid HTTPS URLs or accepted image data URLs with a max count.
- Modify `apps/web/src/features/listings/schemas.test.ts` to cover accepted image values, unsupported data URL media types, and count overflow.
- Modify `apps/web/src/features/listings/components/listing-create-form.tsx` to use exported limits, validate selected files before `FileReader`, and show deterministic error messages.
- Modify `apps/web/src/features/listings/components/listing-create-form.test.tsx` to test the pure file-filtering helper.
- Create or update `docs/superpowers/plans/2026-05-28-image-upload-hardening.md` for implementation tracking.

## Tasks

### Task 1: Schema Hardening

**Files:**
- Modify: `apps/web/src/features/listings/schemas.ts`
- Test: `apps/web/src/features/listings/schemas.test.ts`

- [ ] Add failing tests that assert `listingCreateBodySchema` accepts HTTPS URLs and JPEG/PNG/WebP data URLs, rejects `data:image/gif`, and rejects six images.
- [ ] Run `npm test -- schemas.test.ts` and confirm the new tests fail.
- [ ] Export constants: `LISTING_IMAGE_MAX_COUNT`, `LISTING_IMAGE_MAX_BYTES`, `LISTING_IMAGE_ACCEPTED_MIME_TYPES`.
- [ ] Replace the loose image URL schema with a schema that accepts `https://...` URLs and data URLs whose MIME type is one of the accepted image MIME types.
- [ ] Apply `.max(LISTING_IMAGE_MAX_COUNT)` to create and update `imageUrls` arrays.
- [ ] Run `npm test -- schemas.test.ts` and confirm it passes.

### Task 2: Client File Filtering

**Files:**
- Modify: `apps/web/src/features/listings/components/listing-create-form.tsx`
- Test: `apps/web/src/features/listings/components/listing-create-form.test.tsx`

- [ ] Add failing tests for an exported helper that filters selected image files by type, size, and remaining slots.
- [ ] Run `npm test -- listing-create-form.test.tsx` and confirm the new tests fail.
- [ ] Import the shared image constants from `schemas.ts`.
- [ ] Export `filterListingImageFiles(files, currentImageCount)` from `listing-create-form.tsx`.
- [ ] Use the helper in `addFiles` before calling `readFileAsDataUrl`.
- [ ] Change the file input `accept` attribute to the explicit accepted MIME list.
- [ ] Run `npm test -- listing-create-form.test.tsx` and confirm it passes.

### Task 3: Full Verification

**Files:**
- Verify current branch only.

- [ ] Run `npm test`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Commit the implementation with `git commit -m "Harden local image uploads"`.

