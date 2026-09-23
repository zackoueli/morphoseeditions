"use client";

import { useState } from "react";
import type { RelayPoint } from "@/lib/types";

type Props = {
  value: RelayPoint | null;
  onChange: (point: RelayPoint | null) => void;
};

export default function RelayPointPicker({ value, onChange }: Props) {
  const [postalCode, setPostalCode] = useState("");
  const [points, setPoints] = useState<RelayPoint[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPoints(null);
    try {
      const res = await fetch("/api/relay-points/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postalCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "not_configured") {
          setError(
            "La sélection des points relais n'est pas encore disponible. Merci de réessayer plus tard."
          );
        } else {
          setError("Recherche impossible pour ce code postal. Vérifiez-le et réessayez.");
        }
        return;
      }
      if (data.points.length === 0) {
        setError("Aucun point relais trouvé pour ce code postal.");
      }
      setPoints(data.points);
    } catch {
      setError("Recherche impossible pour le moment. Réessayez dans un instant.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border-2 border-ink/10 p-5">
      <p className="font-display text-sm tracking-widest text-ink/70">
        POINT RELAIS MONDIAL RELAY
      </p>

      {value ? (
        <div className="mt-3 flex items-start justify-between gap-4 rounded-md border border-red/30 bg-red/5 p-3">
          <div className="text-sm text-ink/80">
            <p className="font-medium">{value.name}</p>
            <p>{value.line1}</p>
            <p>
              {value.postalCode} {value.city}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-sm text-ink/40 hover:text-red"
          >
            Changer
          </button>
        </div>
      ) : (
        <>
          <form onSubmit={handleSearch} className="mt-3 flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              placeholder="Code postal"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className="w-32 rounded border border-ink/20 px-3 py-2 text-sm"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-ink px-4 py-2 text-sm text-paper transition hover:bg-ink/80 disabled:opacity-60"
            >
              {loading ? "Recherche..." : "Rechercher"}
            </button>
          </form>

          {error && <p className="mt-3 text-sm text-red">{error}</p>}

          {points && points.length > 0 && (
            <ul className="mt-4 flex flex-col gap-2">
              {points.map((point) => (
                <li key={point.id}>
                  <button
                    type="button"
                    onClick={() => onChange(point)}
                    className="w-full rounded-md border border-ink/15 p-3 text-left text-sm text-ink/80 transition hover:border-red hover:bg-red/5"
                  >
                    <span className="flex items-center gap-2">
                      <span className="font-medium">{point.name}</span>
                      {point.shopType === "locker" && (
                        <span className="rounded-full bg-ink/10 px-2 py-0.5 text-xs text-ink/50">
                          Casier 24/7
                        </span>
                      )}
                    </span>
                    <span className="block">{point.line1}</span>
                    <span className="block">
                      {point.postalCode} {point.city}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
