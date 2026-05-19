import {
  createReview,
  getReviewsForListing,
} from "@/features/reviews/mutations";
import {
  listingReviewsParamsSchema,
  reviewCreateBodySchema,
  reviewDetailResponseSchema,
  reviewsResponseSchema,
  serializeReview,
} from "@/features/reviews/schemas";
import { readJsonBody } from "@/server/api/request";
import { apiData, throwIfInvalid, withApiErrorHandling } from "@/server/api/responses";
import { requireCurrentUser } from "@/server/auth/current-user";

export const dynamic = "force-dynamic";

type ListingReviewsRouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _request: Request,
  context: ListingReviewsRouteContext,
) {
  return withApiErrorHandling(async () => {
    const params = throwIfInvalid(
      listingReviewsParamsSchema.safeParse(await context.params),
    );
    const reviews = await getReviewsForListing(params.id);

    return apiData(
      reviewsResponseSchema.parse({
        reviews: reviews.map(serializeReview),
      }),
    );
  });
}

export async function POST(
  request: Request,
  context: ListingReviewsRouteContext,
) {
  return withApiErrorHandling(async () => {
    const currentUser = await requireCurrentUser();
    const params = throwIfInvalid(
      listingReviewsParamsSchema.safeParse(await context.params),
    );
    const body = throwIfInvalid(
      reviewCreateBodySchema.safeParse(await readJsonBody(request)),
    );
    const review = await createReview(params.id, body, currentUser.id);

    return apiData(
      reviewDetailResponseSchema.parse({
        review: review ? serializeReview(review) : null,
      }),
      { status: 201 },
    );
  });
}
