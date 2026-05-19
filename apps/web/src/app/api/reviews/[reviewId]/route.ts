import {
  deleteReview,
  updateReview,
} from "@/features/reviews/mutations";
import {
  reviewDetailResponseSchema,
  reviewParamsSchema,
  reviewUpdateBodySchema,
  serializeReview,
} from "@/features/reviews/schemas";
import { reviewNotFound } from "@/server/api/errors";
import { readJsonBody } from "@/server/api/request";
import { apiData, throwIfInvalid, withApiErrorHandling } from "@/server/api/responses";
import { requireCurrentUser } from "@/server/auth/current-user";

export const dynamic = "force-dynamic";

type ReviewRouteContext = {
  params: Promise<{ reviewId: string }>;
};

export async function PATCH(request: Request, context: ReviewRouteContext) {
  return withApiErrorHandling(async () => {
    const currentUser = await requireCurrentUser();
    const params = throwIfInvalid(
      reviewParamsSchema.safeParse(await context.params),
    );
    const body = throwIfInvalid(
      reviewUpdateBodySchema.safeParse(await readJsonBody(request)),
    );
    const review = await updateReview(params.reviewId, body, currentUser.id);

    if (!review) {
      throw reviewNotFound(params.reviewId);
    }

    return apiData(
      reviewDetailResponseSchema.parse({
        review: serializeReview(review),
      }),
    );
  });
}

export async function DELETE(_request: Request, context: ReviewRouteContext) {
  return withApiErrorHandling(async () => {
    const currentUser = await requireCurrentUser();
    const params = throwIfInvalid(
      reviewParamsSchema.safeParse(await context.params),
    );
    const review = await deleteReview(params.reviewId, currentUser.id);

    if (!review) {
      throw reviewNotFound(params.reviewId);
    }

    return apiData(
      reviewDetailResponseSchema.parse({
        review: serializeReview(review),
      }),
    );
  });
}
