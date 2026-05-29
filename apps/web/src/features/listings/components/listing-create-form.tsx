"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type DragEvent, type FormEvent } from "react";

import { createListingPayloadFromFormData } from "@/features/listings/form-payload";
import {
  LISTING_IMAGE_ACCEPTED_MIME_TYPES,
  LISTING_IMAGE_MAX_BYTES,
  LISTING_IMAGE_MAX_COUNT,
  type ListingCreateInput,
} from "@/features/listings/schemas";
import { buttonVariants } from "@/features/ui/button";
import { fieldInput, fieldLabel, fieldSelect, fieldTextarea } from "@/features/ui/field";
import { FormFeedback } from "@/features/ui/form-feedback";

type ApiErrorBody = {
  error?: {
    message?: string;
  };
};

async function readErrorMessage(response: Response, fallback: string) {
  const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
  return body?.error?.message ?? fallback;
}

type ListingFormValue = {
  id: string;
  title: string;
  type: ListingCreateInput["type"];
  description: string;
  rent: number;
  deposit: number | null;
  utilitiesIncluded: boolean;
  availableFrom: Date | string | null;
  leaseDuration: string | null;
  address: string | null;
  distanceToCampus: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  petPolicy: ListingCreateInput["petPolicy"];
  amenities: string[];
  imageUrls: string[];
  roommateCount?: number | null;
  preferredGender?: string | null;
  lifestyle?: string | null;
  cleanliness?: string | null;
  smokingPolicy?: string | null;
  roommatePreferences?: string | null;
};

type ListingCreateFormProps = {
  listing?: ListingFormValue;
  mode?: "create" | "edit";
  defaultContactEmail?: string | null;
  defaultContactPhone?: string | null;
};

const LISTING_IMAGE_ACCEPT = LISTING_IMAGE_ACCEPTED_MIME_TYPES.join(",");
const LISTING_IMAGE_TYPE_ERROR = "Only JPEG, PNG, and WebP images are supported.";
const LISTING_IMAGE_SIZE_ERROR = "Each image must be 2 MB or smaller.";

function toDateInputValue(value: Date | string | null | undefined) {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString().slice(0, 10);
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result)));
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(file);
  });
}

export function filterListingImageFiles(
  files: FileList | File[],
  currentImageCount: number,
) {
  const acceptedTypes = new Set<string>(LISTING_IMAGE_ACCEPTED_MIME_TYPES);
  const slotsAvailable = LISTING_IMAGE_MAX_COUNT - currentImageCount;

  if (slotsAvailable <= 0) {
    return {
      files: [],
      error: `You can upload up to ${LISTING_IMAGE_MAX_COUNT} images.`,
    };
  }

  let error: string | null = null;
  const validFiles = Array.from(files).filter((file) => {
    if (!acceptedTypes.has(file.type)) {
      error ??= LISTING_IMAGE_TYPE_ERROR;
      return false;
    }

    if (file.size > LISTING_IMAGE_MAX_BYTES) {
      error ??= LISTING_IMAGE_SIZE_ERROR;
      return false;
    }

    return true;
  });

  if (validFiles.length > slotsAvailable) {
    error = `Only ${slotsAvailable} more image(s) can be added.`;
  }

  return {
    files: validFiles.slice(0, slotsAvailable),
    error,
  };
}

type RoommateFitFieldsProps = {
  listing?: Pick<
    ListingFormValue,
    | "roommateCount"
    | "preferredGender"
    | "lifestyle"
    | "cleanliness"
    | "smokingPolicy"
    | "roommatePreferences"
  >;
};

export function RoommateFitFields({ listing }: RoommateFitFieldsProps) {
  return (
    <section className="grid gap-4 rounded-2xl border border-stone-200/80 bg-brand-50/40 p-5">
      <div>
        <h2 className="text-sm font-semibold text-stone-950">Roommate fit</h2>
        <p className="mt-1 text-sm text-stone-600">
          Share compatibility details for people comparing roommate leads.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <label
            htmlFor="roommateCount"
            className={fieldLabel()}
          >
            Roommates needed
          </label>
          <input
            id="roommateCount"
            name="roommateCount"
            min="1"
            step="1"
            type="number"
            defaultValue={listing?.roommateCount ?? ""}
            className={fieldInput()}
            placeholder="1"
          />
        </div>

        <div className="grid gap-2">
          <label
            htmlFor="preferredGender"
            className={fieldLabel()}
          >
            Preferred gender
          </label>
          <input
            id="preferredGender"
            name="preferredGender"
            defaultValue={listing?.preferredGender ?? ""}
            className={fieldInput()}
            placeholder="No preference"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <label htmlFor="lifestyle" className={fieldLabel()}>
            Lifestyle
          </label>
          <input
            id="lifestyle"
            name="lifestyle"
            defaultValue={listing?.lifestyle ?? ""}
            className={fieldInput()}
            placeholder="Quiet weekdays, social weekends"
          />
        </div>

        <div className="grid gap-2">
          <label
            htmlFor="cleanliness"
            className={fieldLabel()}
          >
            Cleanliness
          </label>
          <input
            id="cleanliness"
            name="cleanliness"
            defaultValue={listing?.cleanliness ?? ""}
            className={fieldInput()}
            placeholder="Shared chores weekly"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <label
          htmlFor="smokingPolicy"
          className={fieldLabel()}
        >
          Smoking policy
        </label>
        <input
          id="smokingPolicy"
          name="smokingPolicy"
          defaultValue={listing?.smokingPolicy ?? ""}
          className={fieldInput()}
          placeholder="No smoking"
        />
      </div>

      <div className="grid gap-2">
        <label
          htmlFor="roommatePreferences"
          className={fieldLabel()}
        >
          Roommate preferences
        </label>
        <textarea
          id="roommatePreferences"
          name="roommatePreferences"
          rows={3}
          defaultValue={listing?.roommatePreferences ?? ""}
          className={fieldTextarea()}
          placeholder="Graduate students preferred"
        />
      </div>
    </section>
  );
}

export function ListingCreateForm({
  listing,
  mode = "create",
  defaultContactEmail,
  defaultContactPhone,
}: ListingCreateFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUrls, setImageUrls] = useState(listing?.imageUrls ?? []);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState<ListingCreateInput["type"]>(
    listing?.type ?? "APARTMENT",
  );
  const isEditMode = mode === "edit";
  const isRoommateListing = selectedType === "ROOMMATE";

  async function addFiles(files: FileList | File[]) {
    setError(null);
    setNotice(null);

    const result = filterListingImageFiles(files, imageUrls.length);

    if (result.error) {
      setError(result.error);
    }

    if (result.files.length === 0) {
      return;
    }

    const nextImages = await Promise.all(result.files.map(readFileAsDataUrl));

    setImageUrls((current) => [...current, ...nextImages]);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    void addFiles(event.dataTransfer.files);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(isEditMode ? "Saving listing..." : "Posting listing...");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch(
        isEditMode && listing ? `/api/listings/${listing.id}` : "/api/listings",
        {
          method: isEditMode ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(createListingPayloadFromFormData(formData)),
        },
      );

      if (!response.ok) {
        setNotice(null);
        setError(
          await readErrorMessage(
            response,
            isEditMode
              ? "Could not save listing. Please try again."
              : "Could not create listing. Please try again.",
          ),
        );
        return;
      }

      const body = (await response.json()) as {
        data?: { listing?: { id?: string } | null };
      };
      const listingId = body.data?.listing?.id;

      setNotice(isEditMode ? "Listing saved." : "Listing posted.");
      router.push(listingId ? `/listings/${listingId}` : "/listings");
      router.refresh();
    } catch {
      setNotice(null);
      setError(
        isEditMode
          ? "Could not save listing. Please try again."
          : "Could not create listing. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
      {imageUrls.map((imageUrl) => (
        <input key={imageUrl} type="hidden" name="imageUrls" value={imageUrl} />
      ))}

      {error ? (
        <FormFeedback tone="error">{error}</FormFeedback>
      ) : null}
      {notice ? (
        <FormFeedback tone={isSubmitting ? "info" : "success"}>
          {notice}
        </FormFeedback>
      ) : null}

      <div className="grid gap-2">
        <label htmlFor="title" className={fieldLabel()}>
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={listing?.title}
          className={fieldInput()}
          placeholder="Sunny room near campus"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <label htmlFor="type" className={fieldLabel()}>
            Type
          </label>
          <select
            id="type"
            name="type"
            required
            defaultValue={listing?.type ?? "APARTMENT"}
            onChange={(event) =>
              setSelectedType(event.target.value as ListingCreateInput["type"])
            }
            className={fieldSelect()}
          >
            <option value="APARTMENT">Apartment</option>
            <option value="ROOM">Room</option>
            <option value="ROOMMATE">Roommate lead</option>
          </select>
        </div>

        <div className="grid gap-2">
          <label htmlFor="rent" className={fieldLabel()}>
            Rent
          </label>
          <input
            id="rent"
            name="rent"
            required
            min="0"
            step="1"
            type="number"
            defaultValue={listing?.rent}
            className={fieldInput()}
            placeholder="900"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <label htmlFor="description" className={fieldLabel()}>
          Description
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={5}
          defaultValue={listing?.description}
          className={fieldTextarea()}
          placeholder="Share the important details, roommate expectations, and what makes the place useful."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <label htmlFor="deposit" className={fieldLabel()}>
            Deposit
          </label>
          <input
            id="deposit"
            name="deposit"
            min="0"
            step="1"
            type="number"
            defaultValue={listing?.deposit ?? ""}
            className={fieldInput()}
            placeholder="500"
          />
        </div>

        <div className="grid gap-2">
          <label
            htmlFor="availableFrom"
            className={fieldLabel()}
          >
            Available from
          </label>
          <input
            id="availableFrom"
            name="availableFrom"
            type="date"
            defaultValue={toDateInputValue(listing?.availableFrom)}
            className={fieldInput()}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <label
            htmlFor="leaseDuration"
            className={fieldLabel()}
          >
            Lease duration
          </label>
          <input
            id="leaseDuration"
            name="leaseDuration"
            defaultValue={listing?.leaseDuration ?? ""}
            className={fieldInput()}
            placeholder="12 months"
          />
        </div>

        <div className="grid gap-2">
          <label
            htmlFor="distanceToCampus"
            className={fieldLabel()}
          >
            Distance to campus
          </label>
          <input
            id="distanceToCampus"
            name="distanceToCampus"
            defaultValue={listing?.distanceToCampus ?? ""}
            className={fieldInput()}
            placeholder="0.5 miles"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <label htmlFor="address" className={fieldLabel()}>
          Address
        </label>
        <input
          id="address"
          name="address"
          defaultValue={listing?.address ?? ""}
          className={fieldInput()}
          placeholder="720 4th Ave S"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <label
            htmlFor="contactEmail"
            className={fieldLabel()}
          >
            Contact email
          </label>
          <input
            id="contactEmail"
            name="contactEmail"
            type="email"
            defaultValue={listing?.contactEmail ?? defaultContactEmail ?? ""}
            className={fieldInput()}
            placeholder="poster@example.com"
          />
        </div>

        <div className="grid gap-2">
          <label
            htmlFor="contactPhone"
            className={fieldLabel()}
          >
            Contact phone
          </label>
          <input
            id="contactPhone"
            name="contactPhone"
            type="tel"
            defaultValue={listing?.contactPhone ?? defaultContactPhone ?? ""}
            className={fieldInput()}
            placeholder="320-555-1212"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <label htmlFor="bedrooms" className={fieldLabel()}>
            Bedrooms
          </label>
          <input
            id="bedrooms"
            name="bedrooms"
            min="0"
            step="1"
            type="number"
            defaultValue={listing?.bedrooms ?? ""}
            className={fieldInput()}
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="bathrooms" className={fieldLabel()}>
            Bathrooms
          </label>
          <input
            id="bathrooms"
            name="bathrooms"
            min="0"
            step="0.5"
            type="number"
            defaultValue={listing?.bathrooms ?? ""}
            className={fieldInput()}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <label htmlFor="petPolicy" className={fieldLabel()}>
          Pet policy
        </label>
        <select
          id="petPolicy"
          name="petPolicy"
          defaultValue={listing?.petPolicy ?? "UNKNOWN"}
          className={fieldSelect()}
        >
          <option value="UNKNOWN">Not specified</option>
          <option value="PETS_ALLOWED">Pets allowed</option>
          <option value="CATS_ONLY">Cats only</option>
          <option value="DOGS_ONLY">Dogs only</option>
          <option value="NO_PETS">No pets</option>
        </select>
      </div>

      <label className="flex items-center gap-3 text-sm font-medium text-stone-800">
        <input
          name="utilitiesIncluded"
          type="checkbox"
          defaultChecked={listing?.utilitiesIncluded ?? false}
          className="h-4 w-4 rounded border-stone-300 text-brand-700 accent-brand-700"
        />
        Utilities included
      </label>

      {isRoommateListing ? (
        <RoommateFitFields listing={listing} />
      ) : null}

      <div className="grid gap-2">
        <label htmlFor="amenities" className={fieldLabel()}>
          Amenities
        </label>
        <textarea
          id="amenities"
          name="amenities"
          rows={2}
          defaultValue={listing?.amenities.join(", ") ?? ""}
          className={fieldTextarea()}
          placeholder="Laundry, parking, furnished"
        />
      </div>

      <div className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <p className={fieldLabel()}>Images</p>
          <p className="text-xs text-stone-500">
            {imageUrls.length}/{LISTING_IMAGE_MAX_COUNT}
          </p>
        </div>
        <div
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
          className="grid gap-3 rounded-2xl border border-dashed border-stone-300 bg-stone-50/60 px-4 py-8 text-center transition-colors hover:border-brand-300"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={LISTING_IMAGE_ACCEPT}
            multiple
            className="hidden"
            onChange={(event) => {
              if (event.target.files) {
                void addFiles(event.target.files);
                event.target.value = "";
              }
            }}
          />
          <p className="text-sm text-stone-600">Drop images here or choose files.</p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={buttonVariants({ variant: "secondary", size: "sm", className: "mx-auto" })}
          >
            Choose images
          </button>
        </div>
        {imageUrls.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {imageUrls.map((imageUrl, index) => (
              <div
                key={imageUrl}
                className="relative h-28 w-36 shrink-0 overflow-hidden rounded-xl border border-stone-200 bg-stone-100"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={`Listing image ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() =>
                    setImageUrls((current) =>
                      current.filter((currentUrl) => currentUrl !== imageUrl),
                    )
                  }
                  className="absolute right-2 top-2 rounded-lg bg-white/90 px-2 py-1 text-xs font-medium text-stone-950 shadow-sm backdrop-blur hover:bg-white"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={buttonVariants({ size: "lg", className: "w-full sm:w-auto" })}
      >
        {isSubmitting
          ? isEditMode
            ? "Saving..."
            : "Posting..."
          : isEditMode
            ? "Save changes"
            : "Post listing"}
      </button>
    </form>
  );
}
