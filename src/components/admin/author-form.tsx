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
  const [email, setEmail] = useState(author?.email ?? "");
  const [website, setWebsite] = useState(author?.website ?? "");
  const [instagram, setInstagram] = useState(author?.instagram ?? "");
  const [facebook, setFacebook] = useState(author?.facebook ?? "");
  const [published, setPublished] = useState(author?.published ?? false);
  const [photoUrl, setPhotoUrl] = useState(author?.photoUrl ?? "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [portfolioUrls, setPortfolioUrls] = useState<string[]>(
    author?.portfolioImageUrls ?? []
  );
  const [portfolioFiles, setPortfolioFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function removePortfolioUrl(url: string) {
    setPortfolioUrls((urls) => urls.filter((u) => u !== url));
  }

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

      const uploadedPortfolioUrls: string[] = [];
      for (let i = 0; i < portfolioFiles.length; i++) {
        const url = await uploadFile(
          `authors/${workingId}/portfolio/${Date.now()}-${i}.jpg`,
          portfolioFiles[i]
        );
        uploadedPortfolioUrls.push(url);
      }

      const payload = {
        slug: slug || slugify(name),
        name,
        role,
        bio,
        photoUrl: finalPhotoUrl,
        portfolioImageUrls: [...portfolioUrls, ...uploadedPortfolioUrls],
        email,
        website,
        instagram,
        facebook,
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

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-ink/60">E-mail</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md border-2 border-ink/15 px-3 py-2 outline-none focus:border-red"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-ink/60">Site web</span>
          <input
            type="url"
            placeholder="https://..."
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="rounded-md border-2 border-ink/15 px-3 py-2 outline-none focus:border-red"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-ink/60">Instagram (@pseudo ou lien)</span>
          <input
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            className="rounded-md border-2 border-ink/15 px-3 py-2 outline-none focus:border-red"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-ink/60">Facebook (lien)</span>
          <input
            type="url"
            placeholder="https://facebook.com/..."
            value={facebook}
            onChange={(e) => setFacebook(e.target.value)}
            className="rounded-md border-2 border-ink/15 px-3 py-2 outline-none focus:border-red"
          />
        </label>
      </div>

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

      <label className="flex flex-col gap-1">
        <span className="text-sm text-ink/60">
          Portfolio (plusieurs images d&apos;œuvres)
        </span>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setPortfolioFiles(Array.from(e.target.files ?? []))}
        />
        {portfolioFiles.length > 0 && (
          <span className="text-xs text-ink/40">
            {portfolioFiles.length} nouvelle(s) image(s) à envoyer
          </span>
        )}
      </label>

      {portfolioUrls.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {portfolioUrls.map((url) => (
            <div key={url} className="group relative aspect-square overflow-hidden rounded-md border-2 border-ink/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removePortfolioUrl(url)}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink/80 text-xs text-paper opacity-0 transition group-hover:opacity-100"
                aria-label="Retirer cette image"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

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
