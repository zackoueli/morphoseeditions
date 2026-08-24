"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/cart-context";
import type { Issue } from "@/lib/types";

export function AddToCartButton({ issue }: { issue: Issue }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const outOfStock = issue.stock <= 0;

  return (
    <button
      type="button"
      disabled={outOfStock}
      onClick={() => {
        addItem({
          issueId: issue.id,
          slug: issue.slug,
          title: issue.title,
          priceCents: issue.priceCents,
          coverImageUrl: issue.coverImageUrl,
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 1800);
      }}
      className="rounded-full bg-red px-8 py-4 font-display text-lg tracking-wide text-paper transition hover:bg-red-dark disabled:cursor-not-allowed disabled:bg-ink/20 disabled:text-ink/50"
    >
      {outOfStock ? "ÉPUISÉ" : added ? "AJOUTÉ ✓" : "AJOUTER AU PANIER"}
    </button>
  );
}
