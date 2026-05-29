import { createOpenApiDocument } from "@/server/api/openapi";
import { auth } from "@/server/auth/auth";

// Dynamic so the session cookie can be checked per request — the spec is
// only exposed to authenticated users (the docs UI fetches it with creds).
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json(
      { error: { code: "UNAUTHORIZED", message: "Authentication required." } },
      { status: 401 },
    );
  }

  return Response.json(createOpenApiDocument());
}
