import { registerBodySchema } from "@/features/auth/schemas";
import { registerUser } from "@/features/auth/users";
import { readJsonBody } from "@/server/api/request";
import { apiData, throwIfInvalid, withApiErrorHandling } from "@/server/api/responses";

export async function POST(request: Request) {
  return withApiErrorHandling(async () => {
    const body = throwIfInvalid(
      registerBodySchema.safeParse(await readJsonBody(request)),
    );
    const user = await registerUser(body);

    return apiData(
      {
        user,
      },
      { status: 201 },
    );
  });
}
