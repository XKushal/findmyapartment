import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const contactMethodSchema = z.enum(["EMAIL", "PHONE", "ANY"]);

const nullableEmailSchema = z.preprocess(
  (value) => (value === "" || value === null ? null : value),
  z.string().trim().email().nullable(),
);

const nullablePhoneSchema = z.preprocess(
  (value) => (value === "" || value === null ? null : value),
  z.string().trim().min(7).max(30).nullable(),
);

export const contactRequestCreateBodySchema = z.object({
  message: z.string().trim().min(1, "Message is required.").max(2000),
  preferredContactMethod: contactMethodSchema.default("ANY"),
  contactEmail: nullableEmailSchema.default(null),
  contactPhone: nullablePhoneSchema.default(null),
});

export const contactRequestResponseSchema = z.object({
  id: z.string(),
  listingId: z.string(),
  listingTitle: z.string(),
  requesterId: z.string(),
  requesterName: z.string().nullable(),
  requesterEmail: z.string().email().nullable(),
  ownerId: z.string(),
  ownerName: z.string().nullable(),
  ownerEmail: z.string().email().nullable(),
  message: z.string(),
  preferredContactMethod: contactMethodSchema,
  contactEmail: z.string().email().nullable(),
  contactPhone: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const contactRequestDetailResponseSchema = z.object({
  contactRequest: contactRequestResponseSchema,
});

export const contactRequestsResponseSchema = z.object({
  contactRequests: z.array(contactRequestResponseSchema),
});

export type ContactRequestCreateInput = z.infer<
  typeof contactRequestCreateBodySchema
>;
export type ContactRequestApiResponse = z.infer<
  typeof contactRequestResponseSchema
>;

type ContactRequestForApi = {
  id: string;
  listingId: string;
  requesterId: string;
  ownerId: string;
  message: string;
  preferredContactMethod: "EMAIL" | "PHONE" | "ANY";
  contactEmail: string | null;
  contactPhone: string | null;
  listing?: {
    title?: string | null;
  } | null;
  requester?: {
    name?: string | null;
    email?: string | null;
  } | null;
  owner?: {
    name?: string | null;
    email?: string | null;
  } | null;
  createdAt: Date;
  updatedAt: Date;
};

export function serializeContactRequest(
  contactRequest: ContactRequestForApi,
): ContactRequestApiResponse {
  return contactRequestResponseSchema.parse({
    id: contactRequest.id,
    listingId: contactRequest.listingId,
    listingTitle: contactRequest.listing?.title ?? "Listing",
    requesterId: contactRequest.requesterId,
    requesterName: contactRequest.requester?.name ?? null,
    requesterEmail: contactRequest.requester?.email ?? null,
    ownerId: contactRequest.ownerId,
    ownerName: contactRequest.owner?.name ?? null,
    ownerEmail: contactRequest.owner?.email ?? null,
    message: contactRequest.message,
    preferredContactMethod: contactRequest.preferredContactMethod,
    contactEmail: contactRequest.contactEmail,
    contactPhone: contactRequest.contactPhone,
    createdAt: contactRequest.createdAt.toISOString(),
    updatedAt: contactRequest.updatedAt.toISOString(),
  });
}
