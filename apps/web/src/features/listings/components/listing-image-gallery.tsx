"use client";

import { useState } from "react";

type ListingImageGalleryProps = {
  imageUrls: string[];
};

export function ListingImageGallery({ imageUrls }: ListingImageGalleryProps) {
  const images = imageUrls.slice(0, 5);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex];

  if (!activeImage) {
    return null;
  }

  function showPrevious() {
    setActiveIndex((current) =>
      current === 0 ? images.length - 1 : current - 1,
    );
  }

  function showNext() {
    setActiveIndex((current) =>
      current === images.length - 1 ? 0 : current + 1,
    );
  }

  return (
    <section className="mt-8 grid gap-3" aria-label="Listing images">
      <div className="relative overflow-hidden rounded-md border border-zinc-200 bg-zinc-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activeImage}
          alt={`Listing image ${activeIndex + 1}`}
          className="h-[min(58vw,520px)] min-h-72 w-full object-contain"
        />
        {images.length > 1 ? (
          <div className="absolute inset-x-3 top-1/2 flex -translate-y-1/2 justify-between">
            <button
              type="button"
              onClick={showPrevious}
              aria-label="Previous image"
              className="rounded-md bg-white/90 px-3 py-2 text-sm font-medium text-zinc-950 shadow-sm hover:bg-white"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={showNext}
              aria-label="Next image"
              className="rounded-md bg-white/90 px-3 py-2 text-sm font-medium text-zinc-950 shadow-sm hover:bg-white"
            >
              Next
            </button>
          </div>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((imageUrl, index) => (
            <button
              key={imageUrl}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show image ${index + 1}`}
              className={`h-20 w-28 shrink-0 overflow-hidden rounded-md border ${
                activeIndex === index
                  ? "border-zinc-950"
                  : "border-zinc-200 hover:border-zinc-400"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
