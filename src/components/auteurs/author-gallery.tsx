"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { Author } from "@/lib/types";

function instagramHref(value: string) {
  if (value.startsWith("http")) return value;
  const handle = value.replace(/^@/, "");
  return `https://instagram.com/${handle}`;
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
      <path
        d="M14 9h2.5V6H14c-1.9 0-3.5 1.6-3.5 3.5V11H8.5v3H10.5v6h3v-6h2.3l.7-3H13.5v-1.3c0-.4.3-.7.5-.7Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WebIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 12h18M12 3c2.5 2.5 3.8 5.7 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.7-3.8-9s1.3-6.5 3.8-9Z" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function AuthorGallery({ authors }: { authors: Author[] }) {
  const [selected, setSelected] = useState<Author | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!selected) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (lightboxUrl) setLightboxUrl(null);
        else setSelected(null);
      }
    }
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selected, lightboxUrl]);

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
            className="torn-frame relative flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden bg-ink"
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

              {selected.email && (
                <p className="text-sm text-paper/70">
                  <span className="text-paper/40">E-mail : </span>
                  {selected.email}
                </p>
              )}

              {(selected.website || selected.instagram || selected.facebook) && (
                <div className="flex flex-wrap gap-3 text-paper/70">
                  {selected.website && (
                    <a
                      href={selected.website}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label="Site web"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-paper/30 transition hover:border-saffron hover:text-saffron"
                    >
                      <WebIcon />
                    </a>
                  )}
                  {selected.instagram && (
                    <a
                      href={instagramHref(selected.instagram)}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label="Instagram"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-paper/30 transition hover:border-saffron hover:text-saffron"
                    >
                      <InstagramIcon />
                    </a>
                  )}
                  {selected.facebook && (
                    <a
                      href={selected.facebook}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label="Facebook"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-paper/30 transition hover:border-saffron hover:text-saffron"
                    >
                      <FacebookIcon />
                    </a>
                  )}
                </div>
              )}

              {selected.portfolioImageUrls.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {selected.portfolioImageUrls.map((url) => (
                    <button
                      key={url}
                      type="button"
                      onClick={() => setLightboxUrl(url)}
                      className="relative aspect-square overflow-hidden rounded-md border border-paper/10 transition hover:opacity-80"
                    >
                      <Image
                        src={url}
                        alt={`Œuvre de ${selected.name}`}
                        fill
                        sizes="200px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-ink/95 p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxUrl(null)}
            aria-label="Fermer"
            className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-paper/40 bg-ink/40 text-paper backdrop-blur-sm transition hover:border-saffron hover:text-saffron"
          >
            ✕
          </button>
          <div className="relative h-full max-h-[85vh] w-full max-w-4xl">
            <Image
              src={lightboxUrl}
              alt=""
              fill
              sizes="90vw"
              className="object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
