import { listingParamsSchema } from "@/features/listings/schemas";
import {
  saveListing,
  unsaveListing,
} from "@/features/saved-listings/mutations";
import { savedListingResponseSchema } from "@/features/saved-listings/schemas";
import { apiData, throwIfInvalid, withApiErrorHandling } from "@/server/api/responses";
import { requireCurrentUser } from "@/server/auth/current-user";

export const dynamic = "force-dynamic";

type ListingSaveRouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: ListingSaveRouteContext) {
  return withApiErrorHandling(async () => {
    const currentUser = await requireCurrentUser();
    const params = throwIfInvalid(
      listingParamsSchema.safeParse(await context.params),
    );

    await saveListing(currentUser.id, params.id);

    return apiData(savedListingResponseSchema.parse({ saved: true }));
  });
}

export async function DELETE(_request: Request, context: ListingSaveRouteContext) {
  return withApiErrorHandling(async () => {
    const currentUser = await requireCurrentUser();
    const params = throwIfInvalid(
      listingParamsSchema.safeParse(await context.params),
    );

    await unsaveListing(currentUser.id, params.id);

    return apiData(savedListingResponseSchema.parse({ saved: false }));
  });
}
