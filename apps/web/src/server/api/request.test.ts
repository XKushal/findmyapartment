import { describe, expect, it } from "vitest";

import { readJsonBody } from "@/server/api/request";

describe("API request helpers", () => {
  it("returns parsed JSON for valid request bodies", async () => {
    const request = new Request("http://localhost:3000/api/listings", {
      method: "PATCH",
      body: JSON.stringify({ title: "Saint Cloud Apartments" }),
    });

    await expect(readJsonBody(request)).resolves.toEqual({
      title: "Saint Cloud Apartments",
    });
  });

  it("throws a structured bad request error for malformed JSON", async () => {
    const request = new Request("http://localhost:3000/api/listings", {
      method: "PATCH",
      body: '{ "title": "Saint Cloud Apartments", }',
    });

    await expect(readJsonBody(request)).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: "Request body must be valid JSON.",
      status: 400,
    });
  });
});
