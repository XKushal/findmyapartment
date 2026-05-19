import { createOpenApiDocument } from "@/server/api/openapi";

export const dynamic = "force-static";

export async function GET() {
  return Response.json(createOpenApiDocument());
}
