"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type DragEvent, type FormEvent } from "react";

import { createListingPayloadFromFormData } from "@/features/listings/form-payload";
import type { ListingCreateInput } from "@/features/listings/schemas";
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
};

type ListingCreateFormProps = {
  listing?: ListingFormValue;
  mode?: "create" | "edit";
  defaultContactEmail?: string | null;
  defaultContactPhone?: string | null;
};

const MAX_IMAGES = 5;

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
  const isEditMode = mode === "edit";

  async function addFiles(files: FileList | File[]) {
    setError(null);
    setNotice(null);

    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/"),
    );
    const slotsAvailable = MAX_IMAGES - imageUrls.length;

    if (slotsAvailable <= 0) {
      setError(`You can upload up to ${MAX_IMAGES} images.`);
      return;
    }

    if (imageFiles.length > slotsAvailable) {
      setError(`Only ${slotsAvailable} more image(s) can be added.`);
    }

    const nextImages = await Promise.all(
      imageFiles.slice(0, slotsAvailable).map(readFileAsDataUrl),
    );

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
        <label htmlFor="title" className="text-sm font-medium text-zinc-800">
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={listing?.title}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-950"
          placeholder="Sunny room near campus"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <label htmlFor="type" className="text-sm font-medium text-zinc-800">
            Type
          </label>
          <select
            id="type"
            name="type"
            required
            defaultValue={listing?.type ?? "APARTMENT"}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-950"
          >
            <option value="APARTMENT">Apartment</option>
            <option value="ROOM">Room</option>
            <option value="ROOMMATE">Roommate lead</option>
          </select>
        </div>

        <div className="grid gap-2">
          <label htmlFor="rent" className="text-sm font-medium text-zinc-800">
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
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-950"
            placeholder="900"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <label htmlFor="description" className="text-sm font-medium text-zinc-800">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={5}
          defaultValue={listing?.description}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-950"
          placeholder="Share the important details, roommate expectations, and what makes the place useful."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <label htmlFor="deposit" className="text-sm font-medium text-zinc-800">
            Deposit
          </label>
          <input
            id="deposit"
            name="deposit"
            min="0"
            step="1"
            type="number"
            defaultValue={listing?.deposit ?? ""}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-950"
            placeholder="500"
          />
        </div>

        <div className="grid gap-2">
          <label
            htmlFor="availableFrom"
            className="text-sm font-medium text-zinc-800"
          >
            Available from
          </label>
          <input
            id="availableFrom"
            name="availableFrom"
            type="date"
            defaultValue={toDateInputValue(listing?.availableFrom)}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-950"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <label
            htmlFor="leaseDuration"
            className="text-sm font-medium text-zinc-800"
          >
            Lease duration
          </label>
          <input
            id="leaseDuration"
            name="leaseDuration"
            defaultValue={listing?.leaseDuration ?? ""}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-950"
            placeholder="12 months"
          />
        </div>

        <div className="grid gap-2">
          <label
            htmlFor="distanceToCampus"
            className="text-sm font-medium text-zinc-800"
          >
            Distance to campus
          </label>
          <input
            id="distanceToCampus"
            name="distanceToCampus"
            defaultValue={listing?.distanceToCampus ?? ""}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-950"
            placeholder="0.5 miles"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <label htmlFor="address" className="text-sm font-medium text-zinc-800">
          Address
        </label>
        <input
          id="address"
          name="address"
          defaultValue={listing?.address ?? ""}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-950"
          placeholder="720 4th Ave S"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <label
            htmlFor="contactEmail"
            className="text-sm font-medium text-zinc-800"
          >
            Contact email
          </label>
          <input
            id="contactEmail"
            name="contactEmail"
            type="email"
            defaultValue={listing?.contactEmail ?? defaultContactEmail ?? ""}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-950"
            placeholder="poster@example.com"
          />
        </div>

        <div className="grid gap-2">
          <label
            htmlFor="contactPhone"
            className="text-sm font-medium text-zinc-800"
          >
            Contact phone
          </label>
          <input
            id="contactPhone"
            name="contactPhone"
            type="tel"
            defaultValue={listing?.contactPhone ?? defaultContactPhone ?? ""}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-950"
            placeholder="320-555-1212"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <label htmlFor="bedrooms" className="text-sm font-medium text-zinc-800">
            Bedrooms
          </label>
          <input
            id="bedrooms"
            name="bedrooms"
            min="0"
            step="1"
            type="number"
            defaultValue={listing?.bedrooms ?? ""}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-950"
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="bathrooms" className="text-sm font-medium text-zinc-800">
            Bathrooms
          </label>
          <input
            id="bathrooms"
            name="bathrooms"
            min="0"
            step="0.5"
            type="number"
            defaultValue={listing?.bathrooms ?? ""}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-950"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <label htmlFor="petPolicy" className="text-sm font-medium text-zinc-800">
          Pet policy
        </label>
        <select
          id="petPolicy"
          name="petPolicy"
          defaultValue={listing?.petPolicy ?? "UNKNOWN"}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-950"
        >
          <option value="UNKNOWN">Not specified</option>
          <option value="PETS_ALLOWED">Pets allowed</option>
          <option value="CATS_ONLY">Cats only</option>
          <option value="DOGS_ONLY">Dogs only</option>
          <option value="NO_PETS">No pets</option>
        </select>
      </div>

      <label className="flex items-center gap-3 text-sm font-medium text-zinc-800">
        <input
          name="utilitiesIncluded"
          type="checkbox"
          defaultChecked={listing?.utilitiesIncluded ?? false}
          className="h-4 w-4 rounded border-zinc-300"
        />
        Utilities included
      </label>

      <div className="grid gap-2">
        <label htmlFor="amenities" className="text-sm font-medium text-zinc-800">
          Amenities
        </label>
        <textarea
          id="amenities"
          name="amenities"
          rows={2}
          defaultValue={listing?.amenities.join(", ") ?? ""}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-950"
          placeholder="Laundry, parking, furnished"
        />
      </div>

      <div className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-zinc-800">Images</p>
          <p className="text-xs text-zinc-500">
            {imageUrls.length}/{MAX_IMAGES}
          </p>
        </div>
        <div
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
          className="grid gap-3 rounded-md border border-dashed border-zinc-300 px-4 py-6 text-center"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => {
              if (event.target.files) {
                void addFiles(event.target.files);
                event.target.value = "";
              }
            }}
          />
          <p className="text-sm text-zinc-600">Drop images here or choose files.</p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mx-auto rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-zinc-100"
          >
            Choose images
          </button>
        </div>
        {imageUrls.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {imageUrls.map((imageUrl, index) => (
              <div
                key={imageUrl}
                className="relative h-28 w-36 shrink-0 overflow-hidden rounded-md border border-zinc-200 bg-zinc-100"
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
                  className="absolute right-2 top-2 rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-zinc-950 shadow-sm hover:bg-white"
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
        className="rounded-md bg-zinc-950 px-5 py-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
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
