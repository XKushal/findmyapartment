import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const reviewParamsSchema = z.object({
  reviewId: z.string().trim().min(1, "Review id is required."),
});

export const listingReviewsParamsSchema = z.object({
  id: z.string().trim().min(1, "Listing id is required."),
});

export const reviewResponseSchema = z.object({
  id: z.string(),
  listingId: z.string(),
  authorId: z.string(),
  authorName: z.string().nullable(),
  body: z.string(),
  rating: z.number().int().min(1).max(5).nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const reviewsResponseSchema = z.object({
  reviews: z.array(reviewResponseSchema),
});

export const reviewDetailResponseSchema = z.object({
  review: reviewResponseSchema,
});

export const reviewCreateBodySchema = z.object({
  body: z.string().trim().min(1, "Review body is required.").max(2000),
  rating: z.number().int().min(1).max(5).nullable().default(null),
});

export const reviewUpdateBodySchema = z
  .object({
    body: z.string().trim().min(1, "Review body is required.").max(2000).optional(),
    rating: z.number().int().min(1).max(5).nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one review field is required.",
  });

export type ReviewApiResponse = z.infer<typeof reviewResponseSchema>;
export type ReviewCreateInput = z.infer<typeof reviewCreateBodySchema>;
export type ReviewUpdateInput = z.infer<typeof reviewUpdateBodySchema>;

type ReviewForApi = {
  id: string;
  listingId: string;
  authorId: string;
  author?: {
    name?: string | null;
    email?: string | null;
  } | null;
  authorName?: string | null;
  body: string;
  rating: number | null;
  createdAt: Date;
  updatedAt: Date;
};

export function serializeReview(review: ReviewForApi): ReviewApiResponse {
  return reviewResponseSchema.parse({
    id: review.id,
    listingId: review.listingId,
    authorId: review.authorId,
    authorName: review.authorName ?? review.author?.name ?? review.author?.email ?? null,
    body: review.body,
    rating: review.rating,
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
  });
}
