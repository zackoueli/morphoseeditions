"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-fetch";

export default function AdminLibrairesPage() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    adminFetch("/api/admin/libraires")
      .then((res) => res.json())
      .then((data) => {
        setContent(data.content ?? "");
        setLoading(false);
      });
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await adminFetch("/api/admin/libraires", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl tracking-wide">LIBRAIRES</h1>
      <p className="mt-2 text-ink/60">
        Ce texte apparaît sur la page publique &laquo;&nbsp;Libraires&nbsp;&raquo;
        du site, à destination des revendeurs.
      </p>

      {loading ? (
        <p className="mt-8 text-ink/50">Chargement...</p>
      ) : (
        <div className="mt-8 flex max-w-2xl flex-col gap-4">
          <textarea
            rows={16}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="rounded-md border-2 border-ink/15 px-3 py-2 outline-none focus:border-red"
          />
          {saved && <p className="text-sm text-teal">Enregistré.</p>}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="self-start rounded-full bg-red px-6 py-3 font-display tracking-wide text-paper hover:bg-red-dark disabled:opacity-60"
          >
            {saving ? "ENREGISTREMENT..." : "ENREGISTRER"}
          </button>
        </div>
      )}
    </div>
  );
}
