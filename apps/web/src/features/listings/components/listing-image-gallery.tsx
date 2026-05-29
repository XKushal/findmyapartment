"use client";

import { useState } from "react";

import { cn } from "@/features/ui/cn";

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
    <section className="grid gap-3" aria-label="Listing images">
      <div className="relative overflow-hidden rounded-2xl border border-stone-200/80 bg-stone-100 shadow-[var(--shadow-soft)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activeImage}
          alt={`Listing image ${activeIndex + 1}`}
          className="h-[min(58vw,520px)] min-h-72 w-full object-cover"
        />
        {images.length > 1 ? (
          <div className="absolute inset-x-3 top-1/2 flex -translate-y-1/2 justify-between">
            <button
              type="button"
              onClick={showPrevious}
              aria-label="Previous image"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-lg text-stone-900 shadow-md backdrop-blur transition hover:bg-white"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={showNext}
              aria-label="Next image"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-lg text-stone-900 shadow-md backdrop-blur transition hover:bg-white"
            >
              ›
            </button>
          </div>
        ) : null}
        {images.length > 1 ? (
          <div className="absolute bottom-3 right-3 rounded-full bg-stone-950/70 px-2.5 py-1 text-xs font-medium text-white">
            {activeIndex + 1} / {images.length}
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
              className={cn(
                "h-20 w-28 shrink-0 overflow-hidden rounded-xl border-2 transition",
                activeIndex === index
                  ? "border-brand-600"
                  : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
