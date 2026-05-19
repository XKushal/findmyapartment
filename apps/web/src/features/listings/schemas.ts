import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const listingTypeSchema = z.enum(["APARTMENT", "ROOM", "ROOMMATE"]);
export const listingStatusSchema = z.enum(["DRAFT", "ACTIVE", "RENTED", "ARCHIVED"]);
const imageUrlSchema = z
  .string()
  .url()
  .openapi({ example: "https://example.com/listing-photo.jpg" });

const nullableEmailSchema = z
  .string()
  .trim()
  .email()
  .nullable();

const nullablePhoneSchema = z
  .string()
  .trim()
  .min(7)
  .max(30)
  .nullable();

export const listingQuerySchema = z.object({
  type: listingTypeSchema.optional(),
});

export const listingParamsSchema = z.object({
  id: z.string().trim().min(1, "Listing id is required."),
});

export const listingResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: listingTypeSchema,
  status: listingStatusSchema,
  description: z.string(),
  rent: z.number().int().nonnegative(),
  deposit: z.number().int().nonnegative().nullable(),
  utilitiesIncluded: z.boolean(),
  availableFrom: z.string().datetime().nullable(),
  leaseDuration: z.string().nullable(),
  address: z.string().nullable(),
  distanceToCampus: z.string().nullable(),
  contactEmail: z.string().email().nullable(),
  contactPhone: z.string().nullable(),
  bedrooms: z.number().int().nonnegative().nullable(),
  bathrooms: z.number().nonnegative().nullable(),
  amenities: z.array(z.string()),
  imageUrls: z.array(imageUrlSchema),
  ownerId: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const listingsResponseSchema = z.object({
  listings: z.array(listingResponseSchema),
});

export const listingDetailResponseSchema = z.object({
  listing: listingResponseSchema,
});

export const listingCreateBodySchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  type: listingTypeSchema,
  status: listingStatusSchema.default("ACTIVE"),
  description: z.string().trim().min(1, "Description is required."),
  rent: z.number().int().nonnegative(),
  deposit: z.number().int().nonnegative().nullable().default(null),
  utilitiesIncluded: z.boolean().default(false),
  availableFrom: z.string().datetime().nullable().default(null),
  leaseDuration: z.string().trim().min(1).nullable().default(null),
  address: z.string().trim().min(1).nullable().default(null),
  distanceToCampus: z.string().trim().min(1).nullable().default(null),
  contactEmail: nullableEmailSchema.default(null),
  contactPhone: nullablePhoneSchema.default(null),
  bedrooms: z.number().int().nonnegative().nullable().default(null),
  bathrooms: z.number().nonnegative().nullable().default(null),
  amenities: z.array(z.string().trim().min(1)).default([]),
  imageUrls: z
    .array(imageUrlSchema)
    .default([])
    .openapi({ example: ["https://example.com/listing-photo.jpg"] }),
});

export const listingUpdateBodySchema = z
  .object({
    title: z.string().trim().min(1, "Title is required.").optional(),
    type: listingTypeSchema.optional(),
    status: listingStatusSchema.optional(),
    description: z.string().trim().min(1, "Description is required.").optional(),
    rent: z.number().int().nonnegative().optional(),
    deposit: z.number().int().nonnegative().nullable().optional(),
    utilitiesIncluded: z.boolean().optional(),
    availableFrom: z.string().datetime().nullable().optional(),
    leaseDuration: z.string().trim().min(1).nullable().optional(),
    address: z.string().trim().min(1).nullable().optional(),
    distanceToCampus: z.string().trim().min(1).nullable().optional(),
    contactEmail: z.string().trim().email().nullable().optional(),
    contactPhone: z.string().trim().min(7).max(30).nullable().optional(),
    bedrooms: z.number().int().nonnegative().nullable().optional(),
    bathrooms: z.number().nonnegative().nullable().optional(),
    amenities: z.array(z.string().trim().min(1)).optional(),
    imageUrls: z
      .array(imageUrlSchema)
      .optional()
      .openapi({ example: ["https://example.com/listing-photo.jpg"] }),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one listing field is required.",
  });

export type ListingApiResponse = z.infer<typeof listingResponseSchema>;
export type ListingCreateInput = z.infer<typeof listingCreateBodySchema>;
export type ListingUpdateInput = z.infer<typeof listingUpdateBodySchema>;

type ListingForApi = {
  id: string;
  title: string;
  type: "APARTMENT" | "ROOM" | "ROOMMATE";
  status: "DRAFT" | "ACTIVE" | "RENTED" | "ARCHIVED";
  description: string;
  rent: number;
  deposit: number | null;
  utilitiesIncluded: boolean;
  availableFrom: Date | null;
  leaseDuration: string | null;
  address: string | null;
  distanceToCampus: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  amenities: string[];
  imageUrls: string[];
  ownerId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export function serializeListing(listing: ListingForApi): ListingApiResponse {
  return listingResponseSchema.parse({
    ...listing,
    contactEmail: listing.contactEmail ?? null,
    contactPhone: listing.contactPhone ?? null,
    availableFrom: listing.availableFrom?.toISOString() ?? null,
    createdAt: listing.createdAt.toISOString(),
    updatedAt: listing.updatedAt.toISOString(),
  });
}

export function toListingWriteData(
  input: ListingCreateInput | ListingUpdateInput,
) {
  return {
    ...input,
    availableFrom: input.availableFrom ? new Date(input.availableFrom) : input.availableFrom,
  };
}
