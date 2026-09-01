"use client";

import { useRef, useState } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import {
  DrawingCanvas,
  type DrawingCanvasHandle,
} from "@/components/donate/drawing-canvas";

type Media = "none" | "photo" | "drawing";

const MAX_MESSAGE = 280;

export function DonationMessageCreate({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [media, setMedia] = useState<Media>("none");
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<DrawingCanvasHandle>(null);

  function reset() {
    setMessage("");
    setAuthorName("");
    setMedia("none");
    setPhotoDataUrl(null);
    setError(null);
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4_000_000) {
      setError("Image trop lourde (4 Mo max).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhotoDataUrl(String(reader.result));
    reader.readAsDataURL(file);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    let imageDataUrl: string | undefined;
    let kind: "photo" | "drawing" | undefined;
    if (media === "photo" && photoDataUrl) {
      imageDataUrl = photoDataUrl;
      kind = "photo";
    } else if (media === "drawing") {
      const drawn = canvasRef.current?.exportPng();
      if (drawn && !canvasRef.current?.isBlank()) {
        imageDataUrl = drawn;
        kind = "drawing";
      }
    }

    if (!message.trim() && !imageDataUrl) {
      setError("Ajoutez un message ou une image.");
      return;
    }

    setBusy(true);
    try {
      const res = await adminFetch("/api/admin/donation-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.trim(),
          authorName: authorName.trim(),
          imageDataUrl,
          kind,
        }),
      });
      if (!res.ok) throw new Error("failed");
      reset();
      setOpen(false);
      onCreated();
    } catch {
      setError("Enregistrement impossible, réessayez.");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-6 rounded-full bg-ink px-6 py-3 font-display text-sm tracking-wide text-paper transition hover:bg-ink/85"
      >
        + AJOUTER UNE CONTRIBUTION
      </button>
    );
  }

  const tab = (v: Media, label: string) => (
    <button
      type="button"
      onClick={() => setMedia(v)}
      className={`rounded-full border-2 px-4 py-2 font-display text-sm tracking-wide transition ${
        media === v
          ? "border-ink bg-ink text-paper"
          : "border-ink/20 text-ink hover:border-ink"
      }`}
    >
      {label}
    </button>
  );

  return (
    <form
      onSubmit={submit}
      className="mt-6 rounded-lg border-2 border-ink/15 bg-white p-6"
    >
      <div className="flex items-center justify-between">
        <p className="font-display text-xl tracking-wide">
          NOUVELLE CONTRIBUTION
        </p>
        <button
          type="button"
          onClick={() => {
            reset();
            setOpen(false);
          }}
          className="text-sm text-ink/50 hover:text-ink"
        >
          Annuler
        </button>
      </div>

      <label className="mt-4 block">
        <span className="font-mono text-xs uppercase tracking-[0.14em] text-red">
          Message
        </span>
        <textarea
          value={message}
          maxLength={MAX_MESSAGE}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-md border-2 border-ink/15 px-4 py-3 outline-none focus:border-red"
        />
        <span className="mt-1 block text-right text-xs text-ink/40">
          {message.length}/{MAX_MESSAGE}
        </span>
      </label>

      <label className="block">
        <span className="font-mono text-xs uppercase tracking-[0.14em] text-red">
          Signature (facultatif)
        </span>
        <input
          value={authorName}
          maxLength={80}
          onChange={(e) => setAuthorName(e.target.value)}
          className="mt-1 w-full rounded-md border-2 border-ink/15 px-4 py-3 outline-none focus:border-red"
        />
      </label>

      <div className="mt-4 flex flex-wrap gap-2">
        {tab("none", "AUCUN")}
        {tab("photo", "PHOTO")}
        {tab("drawing", "DESSIN")}
      </div>

      {media === "photo" && (
        <div className="mt-4">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handlePhoto}
            className="block w-full text-sm text-ink/70 file:mr-4 file:rounded-full file:border-2 file:border-ink/20 file:bg-paper file:px-4 file:py-2 file:font-display file:text-sm"
          />
          {photoDataUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoDataUrl}
              alt="Aperçu"
              className="mt-3 max-h-64 rounded-md border-2 border-ink/10"
            />
          )}
        </div>
      )}

      {media === "drawing" && (
        <div className="mt-4">
          <DrawingCanvas ref={canvasRef} />
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="mt-5 rounded-full bg-red px-8 py-3 font-display text-base tracking-wide text-paper transition hover:bg-red-dark disabled:opacity-60"
      >
        {busy ? "ENREGISTREMENT..." : "PUBLIER"}
      </button>
    </form>
  );
}
