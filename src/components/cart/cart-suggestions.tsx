"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart/cart-context";
import { formatPrice } from "@/lib/format";
import type { Issue } from "@/lib/types";

/** Autres numéros disponibles, à ajouter au panier sans frais de port supplémentaires. */
export default function CartSuggestions() {
  const { lines, addItem } = useCart();
  const [issues, setIssues] = useState<Issue[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/issues")
      .then((res) => res.json())
      .then((data: Issue[]) => {
        if (!cancelled) setIssues(data);
      })
      .catch(() => {
        // suggestions facultatives : on n'affiche rien si l'appel échoue
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const suggestions = issues
    .filter((i) => i.stock > 0 && !lines.some((l) => l.issueId === i.id))
    .slice(0, 3);

  if (suggestions.length === 0) return null;

  return (
    <div className="rounded-lg border-2 border-ink/10 p-5">
      <p className="font-display text-sm tracking-widest text-ink/70">
        AJOUTEZ UN AUTRE NUMÉRO — MÊMES FRAIS DE PORT
      </p>
      <ul className="mt-4 flex flex-col gap-4">
        {suggestions.map((issue) => (
          <li key={issue.id} className="flex items-center gap-4">
            <Link
              href={`/catalogue/${issue.slug}`}
              className="relative h-20 w-14 shrink-0 overflow-hidden rounded bg-ink/5"
            >
              <Image
                src={issue.coverImageUrl}
                alt={`Couverture de ${issue.title}`}
                fill
                sizes="56px"
                className="object-cover"
              />
            </Link>
            <div className="flex-1">
              <Link
                href={`/catalogue/${issue.slug}`}
                className="font-display text-lg tracking-wide hover:text-red"
              >
                {issue.title}
              </Link>
              <p className="text-sm text-ink/60">{formatPrice(issue.priceCents)}</p>
            </div>
            <button
              type="button"
              onClick={() =>
                addItem({
                  issueId: issue.id,
                  slug: issue.slug,
                  title: issue.title,
                  priceCents: issue.priceCents,
                  coverImageUrl: issue.coverImageUrl,
                })
              }
              className="rounded-full border-2 border-ink px-4 py-2 font-display text-sm tracking-wide transition hover:border-red hover:text-red"
            >
              AJOUTER
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
