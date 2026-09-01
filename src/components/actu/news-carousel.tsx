"use client";

import Image from "next/image";
import { useState } from "react";

export function NewsCarousel({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [index, setIndex] = useState(0);

  if (images.length === 0) return null;

  const count = images.length;
  const go = (next: number) => setIndex((next + count) % count);

  return (
    <div className="mt-8">
      <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-ink/5">
        {images.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt={`${title} — image ${i + 1}`}
            fill
            sizes="(min-width: 768px) 768px, 100vw"
            className={`object-cover transition-opacity duration-300 ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
            priority={i === 0}
          />
        ))}

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Image précédente"
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-ink/70 text-lg text-paper transition hover:bg-ink"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Image suivante"
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-ink/70 text-lg text-paper transition hover:bg-ink"
            >
              ›
            </button>
            <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
              {images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Aller à l'image ${i + 1}`}
                  className={`h-2 w-2 rounded-full transition ${
                    i === index ? "bg-paper" : "bg-paper/40"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => go(i)}
              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-md border-2 transition ${
                i === index ? "border-red" : "border-transparent opacity-70"
              }`}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="96px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
