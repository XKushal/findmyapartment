import {
  extendZodWithOpenApi,
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import {
  listingCreateBodySchema,
  listingDetailResponseSchema,
  listingParamsSchema,
  listingQuerySchema,
  listingUpdateBodySchema,
  listingsResponseSchema,
} from "@/features/listings/schemas";

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
  registry.register("ListingCreateBody", listingCreateBodySchema);
  registry.register("ListingUpdateBody", listingUpdateBodySchema);
  registry.register("ListingsResponse", listingsResponseSchema);
  registry.register("ListingDetailResponse", listingDetailResponseSchema);

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
      "Local/dev-only endpoint for creating listings before authentication is added.",
    request: {
      body: jsonRequestBody(listingCreateBodySchema, "Listing create payload."),
    },
    responses: {
      201: jsonContent(listingDetailResponseSchema, "Created listing response."),
      400: jsonContent(apiErrorResponseSchema, "Validation error response."),
      403: jsonContent(apiErrorResponseSchema, "Local-only endpoint response."),
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
      "Local/dev-only endpoint for updating listings before authentication is added.",
    request: {
      params: listingParamsSchema,
      body: jsonRequestBody(listingUpdateBodySchema, "Listing update payload."),
    },
    responses: {
      200: jsonContent(listingDetailResponseSchema, "Updated listing response."),
      400: jsonContent(apiErrorResponseSchema, "Validation error response."),
      403: jsonContent(apiErrorResponseSchema, "Local-only endpoint response."),
      404: jsonContent(apiErrorResponseSchema, "Listing not found response."),
      500: jsonContent(apiErrorResponseSchema, "Unexpected server error response."),
    },
  });

  registry.registerPath({
    method: "delete",
    path: "/api/listings/{id}",
    summary: "Archive listing",
    description:
      "Local/dev-only endpoint that soft-archives a listing before authentication is added.",
    request: {
      params: listingParamsSchema,
    },
    responses: {
      200: jsonContent(listingDetailResponseSchema, "Archived listing response."),
      400: jsonContent(apiErrorResponseSchema, "Validation error response."),
      403: jsonContent(apiErrorResponseSchema, "Local-only endpoint response."),
      404: jsonContent(apiErrorResponseSchema, "Listing not found response."),
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
