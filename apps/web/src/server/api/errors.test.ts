import { describe, expect, it } from "vitest";

import {
  ApiError,
  badRequest,
  normalizeApiError,
  serializeApiError,
} from "@/server/api/errors";

describe("API errors", () => {
  it("serializes expected API errors with code, message, status, and details", () => {
    const error = new ApiError({
      code: "LISTING_NOT_FOUND",
      message: "Listing was not found.",
      status: 404,
      details: { id: "abc123" },
    });

    expect(serializeApiError(error)).toEqual({
      error: {
        code: "LISTING_NOT_FOUND",
        message: "Listing was not found.",
        status: 404,
        details: { id: "abc123" },
      },
    });
  });

  it("normalizes unknown errors without leaking internal messages", () => {
    const error = normalizeApiError(new Error("database password leaked"));

    expect(serializeApiError(error)).toEqual({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong while processing the request.",
        status: 500,
        details: {},
      },
    });
  });

  it("serializes bad request errors for malformed request bodies", () => {
    const error = badRequest("Request body must be valid JSON.");

    expect(serializeApiError(error)).toEqual({
      error: {
        code: "BAD_REQUEST",
        message: "Request body must be valid JSON.",
        status: 400,
        details: {},
      },
    });
  });
});
