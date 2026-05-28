# Image Upload Hardening Design

## Goal

Harden the current local image upload flow for listing create and edit forms without adding external storage, upload credentials, or deployment-specific services.

## Scope

This version keeps listing images as data URLs stored in `Listing.imageUrls`. It improves validation and user feedback around that existing approach.

In scope:

- Allow only JPEG, PNG, and WebP listing images.
- Keep the existing maximum of five images per listing.
- Add a per-image file size limit before files are read into memory.
- Enforce image URL count, MIME, and data URL shape in API schemas.
- Show clear form errors when a user selects unsupported files, oversized files, or too many files.
- Preserve existing create/edit listing behavior and image previews.

Out of scope:

- Vercel Blob, Cloudinary, S3, or any other hosted image storage.
- Server-side image resizing, compression, transcoding, or virus scanning.
- Multi-part upload endpoints.
- Image reorder controls.

## Recommended Limits

- Maximum images per listing: `5`.
- Maximum size per selected file: `2 MB`.
- Accepted MIME types: `image/jpeg`, `image/png`, `image/webp`.
- Accepted stored values: HTTPS URLs or data URLs whose media type is one of the accepted MIME types.

The schema should keep HTTPS URL support because existing seed/test data and future storage migration may use normal hosted URLs. It should not accept arbitrary data URL media types.

## User Experience

The listing form keeps the current drag/drop and "Choose images" controls. When files are selected:

- Unsupported files are skipped and the form shows `Only JPEG, PNG, and WebP images are supported.`
- Oversized files are skipped and the form shows `Each image must be 2 MB or smaller.`
- If the user selects more images than remaining slots, the form adds only the allowed number and shows the remaining-slot message.
- If no valid files remain after filtering, no previews are added.

The file picker should advertise the allowed MIME types with an explicit `accept` value instead of generic `image/*`.

## Validation

Client validation prevents bad files before they are read by `FileReader`. API schema validation is the source of truth for saved listing payloads and rejects invalid or excessive `imageUrls` even if the UI is bypassed.

The payload builder can continue to read hidden `imageUrls` fields from `FormData`; the hardening belongs in the image selection helper and the listing schemas.

## Testing

Add focused tests for:

- Listing write schema accepts HTTPS URLs and valid JPEG/PNG/WebP data URLs.
- Listing write schema rejects unsupported data URL MIME types.
- Listing write schema rejects more than five image URLs.
- The listing form image helper returns only accepted, in-limit files and explains rejected files.

Run the existing local checks after implementation:

- `npm test`
- `npm run lint`
- `npm run build`
