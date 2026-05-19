import {
  listingUpdateBodySchema,
  listingParamsSchema,
  serializeListing,
} from "@/features/listings/schemas";
import { getListingById } from "@/features/listings/queries";
import { archiveListing, updateListing } from "@/features/listings/mutations";
import { listingNotFound } from "@/server/api/errors";
import { assertLocalWriteApiAllowed } from "@/server/api/local-only";
import { readJsonBody } from "@/server/api/request";
import { apiData, throwIfInvalid, withApiErrorHandling } from "@/server/api/responses";

export const dynamic = "force-dynamic";

type ListingRouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: ListingRouteContext) {
  return withApiErrorHandling(async () => {
    const params = throwIfInvalid(
      listingParamsSchema.safeParse(await context.params),
    );
    const listing = await getListingById(params.id);

    if (!listing) {
      throw listingNotFound(params.id);
    }

    return apiData({
      listing: serializeListing(listing),
    });
  });
}

export async function PATCH(request: Request, context: ListingRouteContext) {
  return withApiErrorHandling(async () => {
    assertLocalWriteApiAllowed();

    const params = throwIfInvalid(
      listingParamsSchema.safeParse(await context.params),
    );
    const body = throwIfInvalid(
      listingUpdateBodySchema.safeParse(await readJsonBody(request)),
    );
    const listing = await updateListing(params.id, body);

    if (!listing) {
      throw listingNotFound(params.id);
    }

    return apiData({
      listing: serializeListing(listing),
    });
  });
}

export async function DELETE(_request: Request, context: ListingRouteContext) {
  return withApiErrorHandling(async () => {
    assertLocalWriteApiAllowed();

    const params = throwIfInvalid(
      listingParamsSchema.safeParse(await context.params),
    );
    const listing = await archiveListing(params.id);

    if (!listing) {
      throw listingNotFound(params.id);
    }

    return apiData({
      listing: serializeListing(listing),
    });
  });
}
