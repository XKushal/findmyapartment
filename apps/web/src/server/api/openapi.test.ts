import { describe, expect, it } from "vitest";

import { createOpenApiDocument } from "@/server/api/openapi";

describe("OpenAPI document", () => {
  it("documents the listing endpoints and shared error envelope", () => {
    const document = createOpenApiDocument();

    expect(document.openapi).toBe("3.0.0");
    expect(document.paths["/api/auth/register"]?.post).toBeDefined();
    expect(document.paths["/api/profile"]?.patch).toBeDefined();
    expect(document.paths["/api/listings"]?.get).toBeDefined();
    expect(document.paths["/api/listings"]?.post).toBeDefined();
    expect(document.paths["/api/listings/{id}"]?.get).toBeDefined();
    expect(document.paths["/api/listings/{id}"]?.patch).toBeDefined();
    expect(document.paths["/api/listings/{id}"]?.delete).toBeDefined();
    expect(document.paths["/api/listings/{id}/reviews"]?.get).toBeDefined();
    expect(document.paths["/api/listings/{id}/reviews"]?.post).toBeDefined();
    expect(document.paths["/api/listings/{id}/contact-requests"]?.post).toBeDefined();
    expect(document.paths["/api/listings/{id}/save"]?.post).toBeDefined();
    expect(document.paths["/api/listings/{id}/save"]?.delete).toBeDefined();
    expect(document.paths["/api/reviews/{reviewId}"]?.patch).toBeDefined();
    expect(document.paths["/api/reviews/{reviewId}"]?.delete).toBeDefined();
    expect(document.components?.schemas?.ApiErrorResponse).toBeDefined();
    expect(document.components?.schemas?.RegisterResponse).toBeDefined();
    expect(document.components?.schemas?.ProfileUpdateBody).toBeDefined();
    expect(document.components?.schemas?.UserResponse).toBeDefined();
    expect(document.components?.schemas?.ReviewDetailResponse).toBeDefined();
    expect(document.components?.schemas?.ContactRequestCreateBody).toBeDefined();
    expect(document.components?.schemas?.ContactRequestDetailResponse).toBeDefined();
    expect(document.components?.schemas?.ListingCreateBody).toMatchObject({
      properties: expect.objectContaining({
        roommatePreferences: expect.any(Object),
      }),
    });
    expect(document.components?.schemas?.ListingUpdateBody).toMatchObject({
      properties: expect.objectContaining({
        roommatePreferences: expect.any(Object),
      }),
    });
    expect(document.components?.schemas?.ListingDetailResponse).toMatchObject({
      properties: {
        listing: {
          properties: {
            roommatePreferences: expect.any(Object),
          },
        },
      },
    });
    expect(document.paths["/api/listings"]?.post?.responses?.[401]).toBeDefined();
    expect(document.paths["/api/listings/{id}"]?.patch?.responses?.[403]).toBeDefined();
    expect(
      document.paths["/api/listings/{id}/contact-requests"]?.post?.responses?.[401],
    ).toBeDefined();
    expect(
      document.paths["/api/listings/{id}/contact-requests"]?.post?.responses?.[403],
    ).toBeDefined();
    expect(document.paths["/api/listings/{id}/save"]?.post?.responses?.[401]).toBeDefined();
    expect(document.paths["/api/profile"]?.patch?.responses?.[401]).toBeDefined();
    expect(
      document.paths["/api/listings/{id}/reviews"]?.post?.responses?.[403],
    ).toBeDefined();
    expect(document.paths["/api/reviews/{reviewId}"]?.patch?.responses?.[403]).toBeDefined();
  });
});
