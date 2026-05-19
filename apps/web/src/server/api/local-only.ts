import { localOnlyEndpoint } from "@/server/api/errors";

export function assertLocalWriteApiAllowed() {
  if (process.env.NODE_ENV === "production") {
    throw localOnlyEndpoint();
  }
}
