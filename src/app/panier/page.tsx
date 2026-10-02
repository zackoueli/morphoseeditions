"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useCart, type CartLine } from "@/components/cart/cart-context";
import RelayPointPicker from "@/components/cart/relay-point-picker";
import BookshopsNotice from "@/components/cart/bookshops-notice";
import CartSuggestions from "@/components/cart/cart-suggestions";
import { formatPrice } from "@/lib/format";
import { SHIPPING_FLAT_RATE_CENTS } from "@/lib/stripe";
import type { Issue, RelayPoint } from "@/lib/types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// useSearchParams impose une frontière Suspense pour que la page reste pré-rendue.
export default function CartPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] bg-paper" />}>
      <Cart />
    </Suspense>
  );
}

function Cart() {
  const { lines, setQuantity, removeItem, replaceLines, totalCents } = useCart();
  const router = useRouter();
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [relayPoint, setRelayPoint] = useState<RelayPoint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lien « Reprendre ma commande » de l'e-mail de rappel : /panier?reprise=id:qté,id:qté
  const restoreParam = useSearchParams().get("reprise");
  const restoring = restoreParam !== null;

  useEffect(() => {
    if (!restoreParam) return;
    let cancelled = false;

    const wanted = new Map<string, number>();
    for (const part of restoreParam.split(",")) {
      const [issueId, quantity] = part.split(":");
      const qty = Math.min(20, Math.floor(Number(quantity)));
      if (issueId && qty >= 1) wanted.set(issueId, qty);
    }

    fetch("/api/issues")
      .then((res) => res.json())
      .then((issues: Issue[]) => {
        if (cancelled) return;
        const restored: CartLine[] = issues
          .filter((issue) => wanted.has(issue.id) && issue.stock > 0)
          .map((issue) => ({
            issueId: issue.id,
            slug: issue.slug,
            title: issue.title,
            priceCents: issue.priceCents,
            coverImageUrl: issue.coverImageUrl,
            quantity: Math.min(wanted.get(issue.id)!, issue.stock),
          }));
        if (restored.length > 0) replaceLines(restored);
      })
      .catch(() => {
        // reprise impossible : on garde le panier déjà présent sur cet appareil
      })
      .finally(() => {
        // retire le paramètre de l'URL : un rechargement ne doit pas écraser le panier
        if (!cancelled) router.replace("/panier");
      });

    return () => {
      cancelled = true;
    };
  }, [restoreParam, replaceLines, router]);

  async function handleCheckout() {
    if (!customerName.trim() || !customerPhone.trim()) {
      setError("Merci de renseigner votre nom et votre téléphone.");
      return;
    }
    if (!EMAIL_PATTERN.test(customerEmail.trim())) {
      setError("Merci de renseigner une adresse e-mail valide.");
      return;
    }
    if (!relayPoint) {
      setError("Merci de choisir un point relais avant de continuer.");
      return;
    }

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
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim(),
          relayPoint,
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
            {restoring ? "CHARGEMENT DE VOTRE PANIER…" : "VOTRE PANIER EST VIDE"}
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
            <span>Livraison en point relais Mondial Relay</span>
            <span>{formatPrice(SHIPPING_FLAT_RATE_CENTS)}</span>
          </div>
          <p className="text-xs text-ink/40">
            Frais de port fixes, quel que soit le nombre de revues.
          </p>
          <div className="flex justify-between font-display text-2xl">
            <span>Total</span>
            <span>{formatPrice(totalCents + SHIPPING_FLAT_RATE_CENTS)}</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4">
          <CartSuggestions />
          <BookshopsNotice />
        </div>

        <div className="mt-8 flex flex-col gap-4">
          <p className="font-display text-sm tracking-widest text-ink/70">
            VOS COORDONNÉES
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm text-ink/60">
              Nom et prénom
              <input
                type="text"
                name="name"
                autoComplete="name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="rounded border border-ink/20 px-3 py-2.5 text-base text-ink"
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-ink/60">
              Téléphone
              <input
                type="tel"
                name="tel"
                autoComplete="tel"
                inputMode="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="rounded border border-ink/20 px-3 py-2.5 text-base text-ink"
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-ink/60 sm:col-span-2">
              E-mail (confirmation et suivi du colis)
              <input
                type="email"
                name="email"
                autoComplete="email"
                inputMode="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="rounded border border-ink/20 px-3 py-2.5 text-base text-ink"
                required
              />
              <span className="text-xs text-ink/40">
                Si vous ne terminez pas votre commande, nous vous enverrons un
                seul e-mail de rappel avec un lien vers votre panier.
              </span>
            </label>
          </div>

          <RelayPointPicker value={relayPoint} onChange={setRelayPoint} />
        </div>

        {error && (
          <p role="alert" className="mt-4 text-sm text-red">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleCheckout}
          disabled={loading}
          className="mt-8 w-full rounded-full bg-red px-8 py-4 font-display text-lg tracking-wide text-paper transition hover:bg-red-dark disabled:opacity-60"
        >
          {loading ? "REDIRECTION..." : "PASSER LA COMMANDE"}
        </button>
        <p className="mt-3 text-center text-xs text-ink/50">
          Paiement sécurisé par Stripe · Expédié sous 1 à 3 jours ouvrés ·
          Rétractation 14 jours (
          <Link href="/cgv" className="underline hover:text-red">
            CGV
          </Link>
          )
        </p>
      </div>
    </div>
  );
}
