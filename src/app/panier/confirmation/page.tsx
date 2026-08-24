"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "@/components/cart/cart-context";

export default function ConfirmationPage() {
  const { clear } = useCart();

  useEffect(() => {
    clear();
    // volontairement exécuté une seule fois à l'arrivée sur la page de succès Stripe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-paper text-ink">
      <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-4xl tracking-wide text-teal">
          COMMANDE CONFIRMÉE
        </h1>
        <p className="mt-4 text-ink/60">
          Merci pour votre soutien ! Un e-mail de confirmation vous a été
          envoyé. Votre revue sera expédiée prochainement.
        </p>
        <Link
          href="/catalogue"
          className="mt-8 inline-block font-display text-sm tracking-widest text-red hover:underline"
        >
          RETOUR AU CATALOGUE →
        </Link>
      </div>
    </div>
  );
}
