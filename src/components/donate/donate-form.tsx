"use client";

import { useState } from "react";

const PRESET_AMOUNTS_EUR = [5, 10, 25];

export function DonateForm() {
  const [selected, setSelected] = useState<number>(10);
  const [custom, setCustom] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amountEur = custom ? Number(custom) : selected;

  async function handleDonate() {
    if (!amountEur || amountEur <= 0) {
      setError("Merci de choisir un montant valide.");
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
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-3">
        {PRESET_AMOUNTS_EUR.map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => {
              setSelected(amount);
              setCustom("");
            }}
            className={`rounded-full border-2 px-6 py-3 font-display text-lg tracking-wide transition ${
              selected === amount && !custom
                ? "border-red bg-red text-paper"
                : "border-ink/20 text-ink hover:border-red"
            }`}
          >
            {amount} €
          </button>
        ))}
        <input
          type="number"
          min={1}
          placeholder="Autre"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          className="w-24 rounded-full border-2 border-ink/20 px-4 py-3 text-center outline-none focus:border-red"
        />
      </div>

      {error && <p className="text-sm text-red">{error}</p>}

      <button
        type="button"
        onClick={handleDonate}
        disabled={loading}
        className="rounded-full bg-red px-10 py-4 font-display text-lg tracking-wide text-paper transition hover:bg-red-dark disabled:opacity-60"
      >
        {loading ? "REDIRECTION..." : `FAIRE UN DON DE ${amountEur || 0} €`}
      </button>
    </div>
  );
}
