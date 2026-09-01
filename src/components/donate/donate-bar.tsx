"use client";

import { useState } from "react";

const PRESET_AMOUNTS_EUR = [5, 10, 15, 20];

/**
 * Barre de don compacte : montants prédéfinis + montant libre + bouton.
 * Réutilise le flux Stripe de /api/donate (redirection vers Checkout).
 */
export function DonateBar() {
  const [selected, setSelected] = useState<number>(10);
  const [custom, setCustom] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amountEur = custom ? Number(custom) : selected;

  async function handleDonate() {
    if (!amountEur || amountEur <= 0) {
      setError("Choisissez un montant valide.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountCents: Math.round(amountEur * 100) }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "donate_failed");
      window.location.href = data.url;
    } catch {
      setError("Impossible de lancer le paiement, réessayez.");
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-stretch gap-3">
        {PRESET_AMOUNTS_EUR.map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => {
              setSelected(amount);
              setCustom("");
            }}
            className={`min-w-[72px] rounded-full border-2 px-5 py-3 font-display text-lg tracking-wide transition ${
              selected === amount && !custom
                ? "border-ink bg-ink text-paper"
                : "border-ink/25 text-ink hover:border-ink"
            }`}
          >
            {amount} €
          </button>
        ))}

        <div
          className={`flex items-center rounded-full border-2 px-4 transition ${
            custom ? "border-ink" : "border-ink/25"
          }`}
        >
          <span className="font-display text-lg text-ink/50">€</span>
          <input
            type="number"
            min={1}
            placeholder="autre"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            className="w-20 bg-transparent px-2 py-3 text-center font-display text-lg outline-none"
          />
        </div>

        <button
          type="button"
          onClick={handleDonate}
          disabled={loading}
          className="grow rounded-full bg-red px-8 py-3 font-display text-lg tracking-wide text-paper transition hover:bg-red-dark disabled:opacity-60 sm:grow-0"
        >
          {loading ? "REDIRECTION..." : `FAIRE UN DON DE ${amountEur || 0} €`}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red">{error}</p>}
    </div>
  );
}
