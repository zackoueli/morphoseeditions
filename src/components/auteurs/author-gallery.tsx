"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { Author } from "@/lib/types";

function instagramHref(value: string) {
  if (value.startsWith("http")) return value;
  const handle = value.replace(/^@/, "");
  return `https://instagram.com/${handle}`;
}

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
            className="relative flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border-2 border-paper/10 bg-ink"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Fermer"
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-paper/40 bg-ink/40 text-paper backdrop-blur-sm transition hover:border-saffron hover:text-saffron"
            >
              ✕
            </button>

            <div className="relative flex min-h-[280px] shrink-0 flex-col justify-end p-8 sm:p-10">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${selected.photoUrl})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/30" />
              <div className="absolute inset-0 bg-gradient-to-r from-ink/60 via-transparent to-transparent" />

              <div className="relative">
                {selected.role && (
                  <span className="inline-block w-fit rounded-full border border-saffron/50 bg-ink/40 px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-saffron backdrop-blur-sm">
                    {selected.role}
                  </span>
                )}
                <h2 className="mt-4 font-display text-4xl leading-[0.95] tracking-wide text-paper drop-shadow-[0_4px_16px_rgba(0,0,0,0.7)] sm:text-5xl">
                  {selected.name}
                </h2>
              </div>
            </div>

            <div className="flex flex-col gap-6 overflow-y-auto p-8 sm:p-10">
              {selected.bio && (
                <p className="max-w-xl whitespace-pre-line text-sm text-paper/80 sm:text-base">
                  {selected.bio}
                </p>
              )}

              {(selected.email || selected.website || selected.instagram) && (
                <div className="flex flex-wrap gap-3">
                  {selected.email && (
                    <a
                      href={`mailto:${selected.email}`}
                      className="rounded-full border border-paper/30 px-4 py-2 font-display text-xs tracking-widest text-paper transition hover:border-saffron hover:text-saffron"
                    >
                      E-MAIL
                    </a>
                  )}
                  {selected.website && (
                    <a
                      href={selected.website}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="rounded-full border border-paper/30 px-4 py-2 font-display text-xs tracking-widest text-paper transition hover:border-saffron hover:text-saffron"
                    >
                      SITE WEB
                    </a>
                  )}
                  {selected.instagram && (
                    <a
                      href={instagramHref(selected.instagram)}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="rounded-full border border-paper/30 px-4 py-2 font-display text-xs tracking-widest text-paper transition hover:border-saffron hover:text-saffron"
                    >
                      INSTAGRAM
                    </a>
                  )}
                </div>
              )}

              {selected.portfolioImageUrls.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {selected.portfolioImageUrls.map((url) => (
                    <div
                      key={url}
                      className="relative aspect-square overflow-hidden rounded-md border border-paper/10"
                    >
                      <Image
                        src={url}
                        alt={`Œuvre de ${selected.name}`}
                        fill
                        sizes="200px"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
