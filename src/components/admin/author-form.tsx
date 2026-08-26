"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import { uploadFile } from "@/lib/storage-upload";
import type { Author } from "@/lib/types";

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function AuthorForm({
  author,
  authorId,
}: {
  author?: Author;
  authorId?: string;
}) {
  const router = useRouter();
  const [slug, setSlug] = useState(author?.slug ?? "");
  const [name, setName] = useState(author?.name ?? "");
  const [role, setRole] = useState(author?.role ?? "");
  const [bio, setBio] = useState(author?.bio ?? "");
  const [published, setPublished] = useState(author?.published ?? false);
  const [photoUrl, setPhotoUrl] = useState(author?.photoUrl ?? "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      let finalPhotoUrl = photoUrl;
      const workingId = authorId ?? crypto.randomUUID();
      if (photoFile) {
        finalPhotoUrl = await uploadFile(`authors/${workingId}/photo.jpg`, photoFile);
      }

      if (!finalPhotoUrl) {
        throw new Error("Une photo est requise.");
      }

      const payload = {
        slug: slug || slugify(name),
        name,
        role,
        bio,
        photoUrl: finalPhotoUrl,
        published,
      };

      const res = authorId
        ? await adminFetch(`/api/admin/authors/${authorId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await adminFetch("/api/admin/authors", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      if (!res.ok) throw new Error("save_failed");
      router.push("/admin/auteurs");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Une erreur est survenue lors de l'enregistrement."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-5">
      <label className="flex flex-col gap-1">
        <span className="text-sm text-ink/60">Nom</span>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-md border-2 border-ink/15 px-3 py-2 outline-none focus:border-red"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-ink/60">Slug (URL)</span>
        <input
          value={slug}
          placeholder={slugify(name) || "genere-automatiquement"}
          onChange={(e) => setSlug(e.target.value)}
          className="rounded-md border-2 border-ink/15 px-3 py-2 outline-none focus:border-red"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-ink/60">Rôle (illustrateur, poète...)</span>
        <input
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded-md border-2 border-ink/15 px-3 py-2 outline-none focus:border-red"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-ink/60">Biographie</span>
        <textarea
          rows={6}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="rounded-md border-2 border-ink/15 px-3 py-2 outline-none focus:border-red"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-ink/60">
          Photo {photoUrl && "— déjà envoyée"}
        </span>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
        />
      </label>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
        />
        <span className="text-sm">Publié (visible sur le site)</span>
      </label>

      {error && <p className="text-sm text-red">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="self-start rounded-full bg-red px-6 py-3 font-display tracking-wide text-paper hover:bg-red-dark disabled:opacity-60"
      >
        {saving ? "ENREGISTREMENT..." : "ENREGISTRER"}
      </button>
    </form>
  );
}
