"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import type { Author } from "@/lib/types";

export default function AdminAuthorsPage() {
  const [authors, setAuthors] = useState<Author[] | null>(null);

  useEffect(() => {
    adminFetch("/api/admin/authors")
      .then((res) => res.json())
      .then(setAuthors);
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl tracking-wide">AUTEURS</h1>
        <Link
          href="/admin/auteurs/nouveau"
          className="rounded-full bg-red px-5 py-2 font-display text-sm tracking-wide text-paper hover:bg-red-dark"
        >
          + NOUVEL AUTEUR
        </Link>
      </div>

      {!authors ? (
        <p className="mt-8 text-ink/50">Chargement...</p>
      ) : authors.length === 0 ? (
        <p className="mt-8 text-ink/50">Aucun auteur pour l&apos;instant.</p>
      ) : (
        <ul className="mt-8 flex flex-col divide-y divide-ink/10">
          {authors.map((author) => (
            <li key={author.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">{author.name}</p>
                <p className="text-xs text-ink/40">
                  {author.published ? "Publié" : "Brouillon"}
                  {author.role ? ` — ${author.role}` : ""}
                </p>
              </div>
              <Link
                href={`/admin/auteurs/${author.id}`}
                className="text-sm text-red hover:underline"
              >
                Modifier
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
