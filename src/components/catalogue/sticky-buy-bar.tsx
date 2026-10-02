"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart/cart-context";
import { formatPrice } from "@/lib/format";
import type { Issue } from "@/lib/types";

/**
 * Barre d'achat fixée en bas de l'écran sur mobile, visible dès que le bouton
 * principal (repéré par `anchorId`) est sorti de l'écran.
 */
export function StickyBuyBar({ issue, anchorId }: { issue: Issue; anchorId: string }) {
  const { addItem, lines } = useCart();
  const [visible, setVisible] = useState(false);
  const inCart = lines.some((l) => l.issueId === issue.id);

  useEffect(() => {
    const anchor = document.getElementById(anchorId);
    if (!anchor) return;
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0)
    );
    observer.observe(anchor);
    return () => observer.disconnect();
  }, [anchorId]);

  if (issue.stock <= 0 || !visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t-2 border-paper/15 bg-ink px-4 py-3 text-paper lg:hidden">
      <div className="min-w-0">
        <p className="truncate font-display text-lg tracking-wide">{issue.title}</p>
        <p className="text-sm text-paper/60">{formatPrice(issue.priceCents)}</p>
      </div>
      {inCart ? (
        <Link
          href="/panier"
          className="shrink-0 rounded-full bg-saffron px-5 py-3 font-display tracking-wide text-ink"
        >
          VOIR LE PANIER
        </Link>
      ) : (
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
          className="shrink-0 rounded-full bg-red px-5 py-3 font-display tracking-wide text-paper"
        >
          AJOUTER AU PANIER
        </button>
      )}
    </div>
  );
}
