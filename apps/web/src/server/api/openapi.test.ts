import { describe, expect, it } from "vitest";

import { createOpenApiDocument } from "@/server/api/openapi";

describe("OpenAPI document", () => {
  it("documents the listing endpoints and shared error envelope", () => {
    const document = createOpenApiDocument();

    expect(document.openapi).toBe("3.0.0");
    expect(document.paths["/api/listings"]?.get).toBeDefined();
    expect(document.paths["/api/listings"]?.post).toBeDefined();
    expect(document.paths["/api/listings/{id}"]?.get).toBeDefined();
    expect(document.paths["/api/listings/{id}"]?.patch).toBeDefined();
    expect(document.paths["/api/listings/{id}"]?.delete).toBeDefined();
    expect(document.components?.schemas?.ApiErrorResponse).toBeDefined();
  });
});
