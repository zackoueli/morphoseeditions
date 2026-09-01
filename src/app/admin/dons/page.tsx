"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { adminFetch } from "@/lib/admin-fetch";
import { DonationMessageCreate } from "@/components/admin/donation-message-create";
import type { DonationMessage } from "@/lib/types";

export default function AdminDonationMessagesPage() {
  const [items, setItems] = useState<DonationMessage[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  function reload() {
    adminFetch("/api/admin/donation-messages")
      .then((res) => res.json())
      .then(setItems);
  }

  useEffect(reload, []);

  async function remove(id: string) {
    if (!confirm("Supprimer cette contribution ? Elle disparaîtra du site.")) {
      return;
    }
    setBusyId(id);
    await adminFetch(`/api/admin/donation-messages/${id}`, { method: "DELETE" });
    setBusyId(null);
    reload();
  }

  return (
    <div>
      <h1 className="font-display text-3xl tracking-wide">
        CONTRIBUTIONS DE DONATEURS
      </h1>
      <p className="mt-2 text-sm text-ink/50">
        Publiées automatiquement sur la page d&apos;accueil. Ajoutez-en une
        manuellement ou supprimez toute contribution problématique.
      </p>

      <DonationMessageCreate onCreated={reload} />

      {!items ? (
        <p className="mt-8 text-ink/50">Chargement...</p>
      ) : items.length === 0 ? (
        <p className="mt-8 text-ink/50">Aucune contribution pour l&apos;instant.</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {items.map((m) => (
            <div
              key={m.id}
              className="flex flex-col gap-3 rounded-lg border-2 border-ink/10 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs text-ink/40">
                  {new Date(m.createdAt).toLocaleString("fr-FR")}
                  {m.kind ? ` · ${m.kind}` : ""}
                </p>
                <button
                  type="button"
                  onClick={() => remove(m.id)}
                  disabled={busyId === m.id}
                  className="rounded-md px-2 py-1 text-sm text-red hover:bg-red/10 disabled:opacity-50"
                >
                  {busyId === m.id ? "..." : "Supprimer"}
                </button>
              </div>

              {m.imageUrl && (
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md border border-ink/10 bg-white">
                  <Image
                    src={m.imageUrl}
                    alt=""
                    fill
                    sizes="400px"
                    className="object-contain"
                    unoptimized
                  />
                </div>
              )}

              {m.message && (
                <p className="whitespace-pre-wrap text-sm text-ink/80">
                  {m.message}
                </p>
              )}
              {m.authorName && (
                <p className="text-xs font-mono uppercase tracking-[0.14em] text-red">
                  — {m.authorName}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
