"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import { uploadFile } from "@/lib/storage-upload";
import type { NewsPost } from "@/lib/types";

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function NewsForm({ post, postId }: { post?: NewsPost; postId?: string }) {
  const router = useRouter();
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [title, setTitle] = useState(post?.title ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [published, setPublished] = useState(post?.published ?? false);
  const [coverImageUrl, setCoverImageUrl] = useState(post?.coverImageUrl ?? "");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [galleryUrls, setGalleryUrls] = useState<string[]>(
    post?.galleryImageUrls ?? []
  );
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const coverPreview = useMemo(
    () => (coverFile ? URL.createObjectURL(coverFile) : null),
    [coverFile]
  );
  useEffect(() => {
    return () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    };
  }, [coverPreview]);

  const galleryPreviews = useMemo(
    () => galleryFiles.map((file) => URL.createObjectURL(file)),
    [galleryFiles]
  );
  useEffect(() => {
    return () => {
      galleryPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [galleryPreviews]);

  function addGalleryFiles(files: FileList | null) {
    if (!files) return;
    setGalleryFiles((prev) => [...prev, ...Array.from(files)]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const workingId = postId ?? crypto.randomUUID();

      let finalCoverUrl = coverImageUrl || null;
      if (coverFile) {
        finalCoverUrl = await uploadFile(`news/${workingId}/cover.jpg`, coverFile);
      }

      const uploadedGalleryUrls: string[] = [];
      for (let i = 0; i < galleryFiles.length; i++) {
        const url = await uploadFile(
          `news/${workingId}/gallery/${Date.now()}-${i}.jpg`,
          galleryFiles[i]
        );
        uploadedGalleryUrls.push(url);
      }

      const payload = {
        slug: slug || slugify(title),
        title,
        excerpt,
        content,
        coverImageUrl: finalCoverUrl,
        galleryImageUrls: [...galleryUrls, ...uploadedGalleryUrls],
        published,
        publishedAt: post?.publishedAt ?? Date.now(),
      };

      const res = postId
        ? await adminFetch(`/api/admin/news/${postId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await adminFetch("/api/admin/news", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      if (!res.ok) throw new Error("save_failed");
      router.push("/admin/actu");
      router.refresh();
    } catch {
      setError("Une erreur est survenue lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-5">
      <label className="flex flex-col gap-1">
        <span className="text-sm text-ink/60">Titre</span>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-md border-2 border-ink/15 px-3 py-2 outline-none focus:border-red"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-ink/60">Slug (URL)</span>
        <input
          value={slug}
          placeholder={slugify(title) || "genere-automatiquement"}
          onChange={(e) => setSlug(e.target.value)}
          className="rounded-md border-2 border-ink/15 px-3 py-2 outline-none focus:border-red"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-ink/60">Résumé</span>
        <textarea
          required
          rows={2}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          className="rounded-md border-2 border-ink/15 px-3 py-2 outline-none focus:border-red"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-ink/60">Contenu</span>
        <textarea
          required
          rows={10}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="rounded-md border-2 border-ink/15 px-3 py-2 outline-none focus:border-red"
        />
      </label>

      <div className="flex flex-col gap-2">
        <span className="text-sm text-ink/60">Image de couverture</span>
        {(coverPreview || coverImageUrl) && (
          <div className="group relative aspect-[16/9] w-full max-w-xs overflow-hidden rounded-md border-2 border-ink/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverPreview ?? coverImageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
            <span className="absolute left-1.5 top-1.5 rounded bg-ink/70 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-paper">
              {coverPreview ? "Nouvelle" : "Actuelle"}
            </span>
            <button
              type="button"
              onClick={() => {
                setCoverFile(null);
                setCoverImageUrl("");
              }}
              className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-ink/80 text-xs text-paper opacity-0 transition group-hover:opacity-100"
              aria-label="Retirer l'image de couverture"
            >
              ✕
            </button>
          </div>
        )}
        <label className="cursor-pointer text-sm text-red hover:underline">
          {coverPreview || coverImageUrl
            ? "Changer l'image…"
            : "Choisir une image…"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm text-ink/60">
          Galerie photo (affichées en carrousel sur l&apos;article)
        </span>

        {(galleryUrls.length > 0 || galleryPreviews.length > 0) && (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {galleryUrls.map((url) => (
              <div
                key={url}
                className="group relative aspect-square overflow-hidden rounded-md border-2 border-ink/10"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() =>
                    setGalleryUrls((urls) => urls.filter((u) => u !== url))
                  }
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink/80 text-xs text-paper opacity-0 transition group-hover:opacity-100"
                  aria-label="Retirer cette image"
                >
                  ✕
                </button>
              </div>
            ))}
            {galleryPreviews.map((url, i) => (
              <div
                key={url}
                className="group relative aspect-square overflow-hidden rounded-md border-2 border-dashed border-red/40"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
                <span className="absolute left-1 top-1 rounded bg-red px-1 py-0.5 text-[10px] font-medium uppercase tracking-wide text-paper">
                  Nouvelle
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setGalleryFiles((files) =>
                      files.filter((_, idx) => idx !== i)
                    )
                  }
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink/80 text-xs text-paper opacity-0 transition group-hover:opacity-100"
                  aria-label="Retirer cette image"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <label className="cursor-pointer text-sm text-red hover:underline">
          Ajouter des images…
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              addGalleryFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      </div>

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
