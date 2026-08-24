"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      let finalCoverUrl = coverImageUrl || null;
      if (coverFile) {
        const workingId = postId ?? crypto.randomUUID();
        finalCoverUrl = await uploadFile(`news/${workingId}/cover.jpg`, coverFile);
      }

      const payload = {
        slug: slug || slugify(title),
        title,
        excerpt,
        content,
        coverImageUrl: finalCoverUrl,
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

      <label className="flex flex-col gap-1">
        <span className="text-sm text-ink/60">
          Image de couverture {coverImageUrl && "— déjà envoyée"}
        </span>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
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
