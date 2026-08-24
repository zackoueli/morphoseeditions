"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart/cart-context";
import { formatPrice } from "@/lib/format";
import { SHIPPING_FLAT_RATE_CENTS } from "@/lib/stripe";

export default function CartPage() {
  const { lines, setQuantity, removeItem, totalCents } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map((l) => ({
            issueId: l.issueId,
            quantity: l.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        if (data.error === "insufficient_stock") {
          setError("Stock insuffisant pour un des articles du panier.");
        } else if (data.error === "issue_unavailable" || data.error === "issue_not_found") {
          setError("Une revue de votre panier n'est plus disponible.");
        } else {
          setError("Impossible de lancer le paiement pour le moment. Réessayez dans un instant.");
        }
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Impossible de lancer le paiement pour le moment. Réessayez dans un instant.");
      setLoading(false);
    }
  }

  if (lines.length === 0) {
    return (
      <div className="bg-paper text-ink">
        <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
          <h1 className="font-display text-4xl tracking-wide">
            VOTRE PANIER EST VIDE
          </h1>
          <Link
            href="/catalogue"
            className="mt-6 inline-block font-display text-sm tracking-widest text-red hover:underline"
          >
            DÉCOUVRIR LE CATALOGUE →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-paper text-ink">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="font-display text-5xl tracking-wide">PANIER</h1>

        <ul className="mt-10 flex flex-col divide-y divide-ink/10">
          {lines.map((line) => (
            <li key={line.issueId} className="flex gap-4 py-6">
              <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded bg-ink/5">
                <Image
                  src={line.coverImageUrl}
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="font-display text-xl tracking-wide">
                    {line.title}
                  </h2>
                  <button
                    type="button"
                    onClick={() => removeItem(line.issueId)}
                    className="text-sm text-ink/40 hover:text-red"
                  >
                    Retirer
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-ink/60">
                    Quantité
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={line.quantity}
                      onChange={(e) =>
                        setQuantity(line.issueId, Number(e.target.value))
                      }
                      className="w-16 rounded border border-ink/20 px-2 py-1"
                    />
                  </label>
                  <span className="font-display text-lg text-red">
                    {formatPrice(line.priceCents * line.quantity)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-col gap-2 border-t-2 border-ink/10 pt-6">
          <div className="flex justify-between text-ink/60">
            <span>Sous-total</span>
            <span>{formatPrice(totalCents)}</span>
          </div>
          <div className="flex justify-between text-ink/60">
            <span>Frais de port</span>
            <span>{formatPrice(SHIPPING_FLAT_RATE_CENTS)}</span>
          </div>
          <div className="flex justify-between font-display text-2xl">
            <span>Total</span>
            <span>{formatPrice(totalCents + SHIPPING_FLAT_RATE_CENTS)}</span>
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-red">{error}</p>}

        <button
          type="button"
          onClick={handleCheckout}
          disabled={loading}
          className="mt-8 w-full rounded-full bg-red px-8 py-4 font-display text-lg tracking-wide text-paper transition hover:bg-red-dark disabled:opacity-60"
        >
          {loading ? "REDIRECTION..." : "PASSER LA COMMANDE"}
        </button>
      </div>
    </div>
  );
}
