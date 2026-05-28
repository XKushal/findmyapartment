import { createContactRequest } from "@/features/contact-requests/mutations";
import {
  contactRequestCreateBodySchema,
  contactRequestDetailResponseSchema,
  serializeContactRequest,
} from "@/features/contact-requests/schemas";
import { listingParamsSchema } from "@/features/listings/schemas";
import { apiData, throwIfInvalid, withApiErrorHandling } from "@/server/api/responses";
import { requireCurrentUser } from "@/server/auth/current-user";

export const dynamic = "force-dynamic";

type ListingContactRequestsRouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(
  request: Request,
  context: ListingContactRequestsRouteContext,
) {
  return withApiErrorHandling(async () => {
    const currentUser = await requireCurrentUser();
    const params = throwIfInvalid(
      listingParamsSchema.safeParse(await context.params),
    );
    const input = throwIfInvalid(
      contactRequestCreateBodySchema.safeParse(await request.json()),
    );

    const contactRequest = await createContactRequest(
      params.id,
      currentUser.id,
      input,
    );

    return apiData(
      contactRequestDetailResponseSchema.parse({
        contactRequest: contactRequest
          ? serializeContactRequest(contactRequest)
          : null,
      }),
      { status: 201 },
    );
  });
}
