import { badRequest } from "@/server/api/errors";

export async function readJsonBody(request: Request) {
  try {
    return await request.json();
  } catch {
    throw badRequest("Request body must be valid JSON.");
  }
}
