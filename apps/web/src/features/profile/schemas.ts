import { z } from "zod";

const optionalContactEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email()
  .nullable()
  .optional();

const optionalContactPhoneSchema = z
  .string()
  .trim()
  .min(7)
  .max(30)
  .nullable()
  .optional();

export const profileUpdateBodySchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters.").max(80).optional(),
    contactEmail: optionalContactEmailSchema,
    contactPhone: optionalContactPhoneSchema,
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one profile field is required.",
  });

export type ProfileUpdateInput = z.infer<typeof profileUpdateBodySchema>;
