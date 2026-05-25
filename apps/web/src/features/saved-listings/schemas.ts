import { z } from "zod";

export const savedListingResponseSchema = z.object({
  saved: z.boolean(),
});
