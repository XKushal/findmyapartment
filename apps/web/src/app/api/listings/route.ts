import { ListingType } from "@prisma/client";

import {
  listingCreateBodySchema,
  listingQuerySchema,
  serializeListing,
} from "@/features/listings/schemas";
import { getActiveListings } from "@/features/listings/queries";
import { createListing } from "@/features/listings/mutations";
import { assertLocalWriteApiAllowed } from "@/server/api/local-only";
import { readJsonBody } from "@/server/api/request";
import { apiData, throwIfInvalid, withApiErrorHandling } from "@/server/api/responses";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return withApiErrorHandling(async () => {
    const url = new URL(request.url);
    const query = throwIfInvalid(
      listingQuerySchema.safeParse({
        type: url.searchParams.get("type") ?? undefined,
      }),
    );

    const listings = await getActiveListings(query.type as ListingType | undefined);

    return apiData({
      listings: listings.map(serializeListing),
    });
  });
}

export async function POST(request: Request) {
  return withApiErrorHandling(async () => {
    assertLocalWriteApiAllowed();

    const body = throwIfInvalid(
      listingCreateBodySchema.safeParse(await readJsonBody(request)),
    );
    const listing = await createListing(body);

    return apiData(
      {
        listing: listing ? serializeListing(listing) : null,
      },
      { status: 201 },
    );
  });
}
