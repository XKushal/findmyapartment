import {
  listingCreateBodySchema,
  listingQuerySchema,
  serializeListing,
} from "@/features/listings/schemas";
import { getActiveListings } from "@/features/listings/queries";
import { createListing } from "@/features/listings/mutations";
import { readJsonBody } from "@/server/api/request";
import { apiData, throwIfInvalid, withApiErrorHandling } from "@/server/api/responses";
import { requireCurrentUser } from "@/server/auth/current-user";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return withApiErrorHandling(async () => {
    const url = new URL(request.url);
    const query = throwIfInvalid(
      listingQuerySchema.safeParse({
        type: url.searchParams.get("type") ?? undefined,
        rentMin: url.searchParams.get("rentMin") ?? undefined,
        rentMax: url.searchParams.get("rentMax") ?? undefined,
        bedroomsMin: url.searchParams.get("bedroomsMin") ?? undefined,
        bathroomsMin: url.searchParams.get("bathroomsMin") ?? undefined,
        availableBy: url.searchParams.get("availableBy") ?? undefined,
        petPolicy: url.searchParams.get("petPolicy") ?? undefined,
      }),
    );

    const listings = await getActiveListings(query);

    return apiData({
      listings: listings.map(serializeListing),
    });
  });
}

export async function POST(request: Request) {
  return withApiErrorHandling(async () => {
    const currentUser = await requireCurrentUser();

    const body = throwIfInvalid(
      listingCreateBodySchema.safeParse(await readJsonBody(request)),
    );
    const listing = await createListing(body, currentUser.id);

    return apiData(
      {
        listing: listing ? serializeListing(listing) : null,
      },
      { status: 201 },
    );
  });
}
