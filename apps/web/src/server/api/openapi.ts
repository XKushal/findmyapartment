import {
  extendZodWithOpenApi,
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import {
  registerBodySchema,
  registerResponseSchema,
} from "@/features/auth/schemas";
import {
  listingCreateBodySchema,
  listingDetailResponseSchema,
  listingParamsSchema,
  listingQuerySchema,
  listingUpdateBodySchema,
  listingsResponseSchema,
} from "@/features/listings/schemas";
import {
  listingReviewsParamsSchema,
  reviewCreateBodySchema,
  reviewDetailResponseSchema,
  reviewParamsSchema,
  reviewUpdateBodySchema,
  reviewsResponseSchema,
} from "@/features/reviews/schemas";

extendZodWithOpenApi(z);

const apiErrorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    status: z.number().int(),
    details: z.record(z.string(), z.unknown()),
  }),
});

function jsonContent(schema: z.ZodType, description: string) {
  return {
    description,
    content: {
      "application/json": {
        schema,
      },
    },
  };
}

function jsonRequestBody(schema: z.ZodType, description: string) {
  return {
    description,
    content: {
      "application/json": {
        schema,
      },
    },
  };
}

export function createOpenApiDocument() {
  const registry = new OpenAPIRegistry();

  registry.register("ApiErrorResponse", apiErrorResponseSchema);
  registry.register("RegisterBody", registerBodySchema);
  registry.register("RegisterResponse", registerResponseSchema);
  registry.register("ListingCreateBody", listingCreateBodySchema);
  registry.register("ListingUpdateBody", listingUpdateBodySchema);
  registry.register("ListingsResponse", listingsResponseSchema);
  registry.register("ListingDetailResponse", listingDetailResponseSchema);
  registry.register("ReviewCreateBody", reviewCreateBodySchema);
  registry.register("ReviewUpdateBody", reviewUpdateBodySchema);
  registry.register("ReviewsResponse", reviewsResponseSchema);
  registry.register("ReviewDetailResponse", reviewDetailResponseSchema);

  registry.registerPath({
    method: "post",
    path: "/api/auth/register",
    summary: "Register with email and password",
    description:
      "Creates a local credentials account. Use the Auth.js credentials sign-in flow after registration to create a session.",
    request: {
      body: jsonRequestBody(registerBodySchema, "Registration payload."),
    },
    responses: {
      201: jsonContent(registerResponseSchema, "Registered user response."),
      400: jsonContent(apiErrorResponseSchema, "Validation error response."),
      409: jsonContent(apiErrorResponseSchema, "Duplicate email response."),
      500: jsonContent(apiErrorResponseSchema, "Unexpected server error response."),
    },
  });

  registry.registerPath({
    method: "get",
    path: "/api/listings",
    summary: "List active listings",
    description: "Returns active apartment, room, and roommate listings.",
    request: {
      query: listingQuerySchema,
    },
    responses: {
      200: jsonContent(listingsResponseSchema, "Active listings response."),
      400: jsonContent(apiErrorResponseSchema, "Validation error response."),
      500: jsonContent(apiErrorResponseSchema, "Unexpected server error response."),
    },
  });

  registry.registerPath({
    method: "post",
    path: "/api/listings",
    summary: "Create listing",
    description:
      "Creates a listing for the signed-in user.",
    request: {
      body: jsonRequestBody(listingCreateBodySchema, "Listing create payload."),
    },
    responses: {
      201: jsonContent(listingDetailResponseSchema, "Created listing response."),
      400: jsonContent(apiErrorResponseSchema, "Validation error response."),
      401: jsonContent(apiErrorResponseSchema, "Authentication required response."),
      500: jsonContent(apiErrorResponseSchema, "Unexpected server error response."),
    },
  });

  registry.registerPath({
    method: "get",
    path: "/api/listings/{id}",
    summary: "Get listing by id",
    description: "Returns a single active listing by id.",
    request: {
      params: listingParamsSchema,
    },
    responses: {
      200: jsonContent(listingDetailResponseSchema, "Listing detail response."),
      400: jsonContent(apiErrorResponseSchema, "Validation error response."),
      404: jsonContent(apiErrorResponseSchema, "Listing not found response."),
      500: jsonContent(apiErrorResponseSchema, "Unexpected server error response."),
    },
  });

  registry.registerPath({
    method: "patch",
    path: "/api/listings/{id}",
    summary: "Update listing",
    description:
      "Updates a listing owned by the signed-in user.",
    request: {
      params: listingParamsSchema,
      body: jsonRequestBody(listingUpdateBodySchema, "Listing update payload."),
    },
    responses: {
      200: jsonContent(listingDetailResponseSchema, "Updated listing response."),
      400: jsonContent(apiErrorResponseSchema, "Validation error response."),
      401: jsonContent(apiErrorResponseSchema, "Authentication required response."),
      403: jsonContent(apiErrorResponseSchema, "Forbidden owner-check response."),
      404: jsonContent(apiErrorResponseSchema, "Listing not found response."),
      500: jsonContent(apiErrorResponseSchema, "Unexpected server error response."),
    },
  });

  registry.registerPath({
    method: "delete",
    path: "/api/listings/{id}",
    summary: "Archive listing",
    description:
      "Soft-archives a listing owned by the signed-in user.",
    request: {
      params: listingParamsSchema,
    },
    responses: {
      200: jsonContent(listingDetailResponseSchema, "Archived listing response."),
      400: jsonContent(apiErrorResponseSchema, "Validation error response."),
      401: jsonContent(apiErrorResponseSchema, "Authentication required response."),
      403: jsonContent(apiErrorResponseSchema, "Forbidden owner-check response."),
      404: jsonContent(apiErrorResponseSchema, "Listing not found response."),
      500: jsonContent(apiErrorResponseSchema, "Unexpected server error response."),
    },
  });

  registry.registerPath({
    method: "get",
    path: "/api/listings/{id}/reviews",
    summary: "List listing reviews",
    description: "Returns comments and optional ratings for a listing.",
    request: {
      params: listingReviewsParamsSchema,
    },
    responses: {
      200: jsonContent(reviewsResponseSchema, "Listing reviews response."),
      400: jsonContent(apiErrorResponseSchema, "Validation error response."),
      500: jsonContent(apiErrorResponseSchema, "Unexpected server error response."),
    },
  });

  registry.registerPath({
    method: "post",
    path: "/api/listings/{id}/reviews",
    summary: "Create listing review",
    description:
      "Creates a comment and optional 1-5 rating for the signed-in user.",
    request: {
      params: listingReviewsParamsSchema,
      body: jsonRequestBody(reviewCreateBodySchema, "Review create payload."),
    },
    responses: {
      201: jsonContent(reviewDetailResponseSchema, "Created review response."),
      400: jsonContent(apiErrorResponseSchema, "Validation error response."),
      401: jsonContent(apiErrorResponseSchema, "Authentication required response."),
      500: jsonContent(apiErrorResponseSchema, "Unexpected server error response."),
    },
  });

  registry.registerPath({
    method: "patch",
    path: "/api/reviews/{reviewId}",
    summary: "Update review",
    description:
      "Updates a review owned by the signed-in user.",
    request: {
      params: reviewParamsSchema,
      body: jsonRequestBody(reviewUpdateBodySchema, "Review update payload."),
    },
    responses: {
      200: jsonContent(reviewDetailResponseSchema, "Updated review response."),
      400: jsonContent(apiErrorResponseSchema, "Validation error response."),
      401: jsonContent(apiErrorResponseSchema, "Authentication required response."),
      403: jsonContent(apiErrorResponseSchema, "Forbidden author-check response."),
      404: jsonContent(apiErrorResponseSchema, "Review not found response."),
      500: jsonContent(apiErrorResponseSchema, "Unexpected server error response."),
    },
  });

  registry.registerPath({
    method: "delete",
    path: "/api/reviews/{reviewId}",
    summary: "Delete review",
    description:
      "Deletes a review owned by the signed-in user.",
    request: {
      params: reviewParamsSchema,
    },
    responses: {
      200: jsonContent(reviewDetailResponseSchema, "Deleted review response."),
      400: jsonContent(apiErrorResponseSchema, "Validation error response."),
      401: jsonContent(apiErrorResponseSchema, "Authentication required response."),
      403: jsonContent(apiErrorResponseSchema, "Forbidden author-check response."),
      404: jsonContent(apiErrorResponseSchema, "Review not found response."),
      500: jsonContent(apiErrorResponseSchema, "Unexpected server error response."),
    },
  });

  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      title: "AllApartments API",
      version: "0.1.0",
      description: "Schema-driven API documentation for the StCloudAptss migration.",
    },
  });
}
