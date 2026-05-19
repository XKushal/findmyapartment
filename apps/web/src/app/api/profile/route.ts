import { updateProfileUser } from "@/features/profile/mutations";
import { profileUpdateBodySchema } from "@/features/profile/schemas";
import { readJsonBody } from "@/server/api/request";
import { apiData, throwIfInvalid, withApiErrorHandling } from "@/server/api/responses";
import { requireCurrentUser } from "@/server/auth/current-user";

export async function PATCH(request: Request) {
  return withApiErrorHandling(async () => {
    const currentUser = await requireCurrentUser();
    const body = throwIfInvalid(
      profileUpdateBodySchema.safeParse(await readJsonBody(request)),
    );
    const user = await updateProfileUser(currentUser.id, body);

    return apiData({
      user,
    });
  });
}
