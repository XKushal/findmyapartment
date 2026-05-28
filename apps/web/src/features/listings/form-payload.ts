import type { ListingCreateInput } from "@/features/listings/schemas";

function stringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function nullableStringValue(formData: FormData, key: string) {
  const value = stringValue(formData, key);
  return value.length > 0 ? value : null;
}

function numberValue(formData: FormData, key: string) {
  return Number(stringValue(formData, key));
}

function nullableNumberValue(formData: FormData, key: string) {
  const value = stringValue(formData, key);
  return value.length > 0 ? Number(value) : null;
}

function repeatedStringValue(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .flatMap((value) => (typeof value === "string" ? [value] : []))
    .map((value) => value.trim())
    .filter(Boolean);
}

function textareaListValue(formData: FormData, key: string) {
  return stringValue(formData, key)
    .split(/[\n,]/)
    .map((value) => value.trim())
    .filter(Boolean);
}

function nullableDateTimeValue(formData: FormData, key: string) {
  const value = stringValue(formData, key);
  return value.length > 0 ? new Date(`${value}T00:00:00.000Z`).toISOString() : null;
}

export function createListingPayloadFromFormData(
  formData: FormData,
): ListingCreateInput {
  return {
    title: stringValue(formData, "title"),
    type: stringValue(formData, "type") as ListingCreateInput["type"],
    status: "ACTIVE",
    description: stringValue(formData, "description"),
    rent: numberValue(formData, "rent"),
    deposit: nullableNumberValue(formData, "deposit"),
    utilitiesIncluded: formData.get("utilitiesIncluded") === "on",
    availableFrom: nullableDateTimeValue(formData, "availableFrom"),
    leaseDuration: nullableStringValue(formData, "leaseDuration"),
    address: nullableStringValue(formData, "address"),
    distanceToCampus: nullableStringValue(formData, "distanceToCampus"),
    contactEmail: nullableStringValue(formData, "contactEmail"),
    contactPhone: nullableStringValue(formData, "contactPhone"),
    bedrooms: nullableNumberValue(formData, "bedrooms"),
    bathrooms: nullableNumberValue(formData, "bathrooms"),
    petPolicy: stringValue(formData, "petPolicy") as ListingCreateInput["petPolicy"],
    amenities: textareaListValue(formData, "amenities"),
    imageUrls: repeatedStringValue(formData, "imageUrls"),
    roommateCount: nullableNumberValue(formData, "roommateCount"),
    preferredGender: nullableStringValue(formData, "preferredGender"),
    lifestyle: nullableStringValue(formData, "lifestyle"),
    cleanliness: nullableStringValue(formData, "cleanliness"),
    smokingPolicy: nullableStringValue(formData, "smokingPolicy"),
    roommatePreferences: nullableStringValue(formData, "roommatePreferences"),
  };
}
