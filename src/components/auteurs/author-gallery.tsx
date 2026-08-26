"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { Author } from "@/lib/types";

export function AuthorGallery({ authors }: { authors: Author[] }) {
  const [selected, setSelected] = useState<Author | null>(null);

  useEffect(() => {
    if (!selected) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setSelected(null);
    }
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selected]);

  return (
    <>
      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {authors.map((author) => (
          <button
            key={author.id}
            type="button"
            onClick={() => setSelected(author)}
            className="group flex flex-col overflow-hidden rounded-lg border-2 border-ink/10 bg-white text-left transition hover:-translate-y-1 hover:border-red"
          >
            <div className="relative aspect-square overflow-hidden bg-ink/5">
              <Image
                src={author.photoUrl}
                alt={author.name}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition duration-300 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-1 flex-col gap-1 p-5">
              <h2 className="font-display text-2xl tracking-wide text-ink">
                {author.name}
              </h2>
              {author.role && (
                <span className="text-sm text-ink/60">{author.role}</span>
              )}
              <span className="mt-auto pt-2 font-display text-xs tracking-widest text-red">
                VOIR LE PROFIL →
              </span>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative w-full max-w-2xl overflow-hidden rounded-lg border-2 border-paper/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${selected.photoUrl})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/80 to-ink/40" />
            <div className="absolute inset-0 bg-gradient-to-r from-ink/60 via-transparent to-transparent" />

            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Fermer"
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-paper/40 bg-ink/40 text-paper backdrop-blur-sm transition hover:border-saffron hover:text-saffron"
            >
              ✕
            </button>

            <div className="relative flex min-h-[420px] flex-col justify-end p-8 sm:p-10">
              {selected.role && (
                <span className="inline-block w-fit rounded-full border border-saffron/50 bg-ink/40 px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-saffron backdrop-blur-sm">
                  {selected.role}
                </span>
              )}
              <h2 className="mt-4 font-display text-4xl leading-[0.95] tracking-wide text-paper drop-shadow-[0_4px_16px_rgba(0,0,0,0.7)] sm:text-5xl">
                {selected.name}
              </h2>
              {selected.bio && (
                <p className="mt-5 max-w-xl whitespace-pre-line text-sm text-paper/80 drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)] sm:text-base">
                  {selected.bio}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
