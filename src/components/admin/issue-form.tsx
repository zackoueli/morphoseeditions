"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import { renderPdfPagesToJpegBlobs } from "@/lib/pdf-to-images";
import { uploadIssueAssets } from "@/lib/storage-upload";
import type { Issue } from "@/lib/types";

type IssueFormValues = {
  slug: string;
  title: string;
  issueNumber: number;
  description: string;
  priceCents: number;
  stock: number;
  published: boolean;
  coverImageUrl: string;
  pageImageUrls: string[];
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function IssueForm({
  issue,
  issueId,
}: {
  issue?: Issue;
  issueId?: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState<IssueFormValues>({
    slug: issue?.slug ?? "",
    title: issue?.title ?? "",
    issueNumber: issue?.issueNumber ?? 1,
    description: issue?.description ?? "",
    priceCents: issue?.priceCents ?? 1500,
    stock: issue?.stock ?? 0,
    published: issue?.published ?? false,
    coverImageUrl: issue?.coverImageUrl ?? "",
    pageImageUrls: issue?.pageImageUrls ?? [],
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      let coverImageUrl = values.coverImageUrl;
      let pageImageUrls = values.pageImageUrls;
      const workingId = issueId ?? crypto.randomUUID();

      if (pdfFile) {
        if (!coverFile) {
          throw new Error("Une image de couverture est requise avec un nouveau PDF.");
        }
        setProgress("Conversion du PDF en pages...");
        const pageBlobs = await renderPdfPagesToJpegBlobs(pdfFile, (done, total) =>
          setProgress(`Conversion des pages : ${done}/${total}`)
        );
        const uploaded = await uploadIssueAssets(
          workingId,
          coverFile,
          pdfFile,
          pageBlobs,
          setProgress
        );
        coverImageUrl = uploaded.coverImageUrl;
        pageImageUrls = uploaded.pageImageUrls;
      } else if (coverFile) {
        setProgress("Envoi de la couverture...");
        const { uploadFile } = await import("@/lib/storage-upload");
        coverImageUrl = await uploadFile(
          `issues/${workingId}/cover.jpg`,
          coverFile
        );
      }

      if (!coverImageUrl) {
        throw new Error("Une image de couverture est requise.");
      }

      setProgress("Enregistrement...");
      const payload = {
        ...values,
        slug: values.slug || slugify(values.title),
        coverImageUrl,
        pageImageUrls,
      };

      const res = issueId
        ? await adminFetch(`/api/admin/issues/${issueId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await adminFetch("/api/admin/issues", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      if (!res.ok) throw new Error("save_failed");

      router.push("/admin/revues");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Une erreur est survenue."
      );
    } finally {
      setSaving(false);
      setProgress(null);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-5">
      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-ink/60">Titre</span>
          <input
            required
            value={values.title}
            onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
            className="rounded-md border-2 border-ink/15 px-3 py-2 outline-none focus:border-red"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-ink/60">Numéro</span>
          <input
            type="number"
            required
            min={1}
            value={values.issueNumber}
            onChange={(e) =>
              setValues((v) => ({ ...v, issueNumber: Number(e.target.value) }))
            }
            className="rounded-md border-2 border-ink/15 px-3 py-2 outline-none focus:border-red"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-ink/60">Slug (URL)</span>
        <input
          value={values.slug}
          placeholder={slugify(values.title) || "genere-automatiquement"}
          onChange={(e) => setValues((v) => ({ ...v, slug: e.target.value }))}
          className="rounded-md border-2 border-ink/15 px-3 py-2 outline-none focus:border-red"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-ink/60">Description</span>
        <textarea
          required
          rows={4}
          value={values.description}
          onChange={(e) =>
            setValues((v) => ({ ...v, description: e.target.value }))
          }
          className="rounded-md border-2 border-ink/15 px-3 py-2 outline-none focus:border-red"
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-ink/60">Prix (en centimes)</span>
          <input
            type="number"
            required
            min={0}
            value={values.priceCents}
            onChange={(e) =>
              setValues((v) => ({ ...v, priceCents: Number(e.target.value) }))
            }
            className="rounded-md border-2 border-ink/15 px-3 py-2 outline-none focus:border-red"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-ink/60">Stock</span>
          <input
            type="number"
            required
            min={0}
            value={values.stock}
            onChange={(e) =>
              setValues((v) => ({ ...v, stock: Number(e.target.value) }))
            }
            className="rounded-md border-2 border-ink/15 px-3 py-2 outline-none focus:border-red"
          />
        </label>
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={values.published}
          onChange={(e) =>
            setValues((v) => ({ ...v, published: e.target.checked }))
          }
        />
        <span className="text-sm">Publiée (visible sur le site)</span>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-ink/60">
          Couverture (image) {values.coverImageUrl && "— déjà envoyée"}
        </span>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-ink/60">
          Fichier PDF de la revue{" "}
          {values.pageImageUrls.length > 0 &&
            `— ${values.pageImageUrls.length} pages déjà converties`}
        </span>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
        />
        <span className="text-xs text-ink/40">
          Le PDF est converti en images de pages directement dans votre
          navigateur avant l&apos;envoi — cela peut prendre une minute pour une
          revue longue.
        </span>
      </label>

      {progress && <p className="text-sm text-teal">{progress}</p>}
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
