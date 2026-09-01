"use client";

import { useRef, useState } from "react";
import { DrawingCanvas, type DrawingCanvasHandle } from "./drawing-canvas";

type Status = "idle" | "sending" | "sent" | "error";
type Tab = "none" | "photo" | "drawing";

const MAX_MESSAGE = 280;

export function DonationMessageForm({ sessionId }: { sessionId: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [tab, setTab] = useState<Tab>("none");
  const [message, setMessage] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const canvasRef = useRef<DrawingCanvasHandle>(null);

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4_000_000) {
      setErrorMsg("Image trop lourde (4 Mo max).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhotoDataUrl(String(reader.result));
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    let imageDataUrl: string | undefined;
    let kind: "photo" | "drawing" | undefined;
    if (tab === "photo" && photoDataUrl) {
      imageDataUrl = photoDataUrl;
      kind = "photo";
    } else if (tab === "drawing") {
      const drawn = canvasRef.current?.exportPng();
      if (drawn && !canvasRef.current?.isBlank()) {
        imageDataUrl = drawn;
        kind = "drawing";
      }
    }

    if (!message.trim() && !imageDataUrl) {
      setErrorMsg("Écrivez un mot ou ajoutez une image.");
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch("/api/donation-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: message.trim(),
          authorName: authorName.trim(),
          imageDataUrl,
          kind,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "failed");
      }
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error && err.message === "already_submitted"
          ? "Une contribution a déjà été envoyée pour ce don."
          : "Envoi impossible, réessayez."
      );
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-xl border-2 border-ink/15 bg-white p-6 text-center">
        <p className="font-display text-2xl tracking-wide text-ink">
          MERCI, C&apos;EST EN LIGNE !
        </p>
        <p className="mt-2 text-sm text-ink/60">
          Votre message rejoint le mur des soutiens sur la page d&apos;accueil.
        </p>
      </div>
    );
  }

  const tabBtn = (value: Tab) =>
    `rounded-full border-2 px-4 py-2 font-display text-sm tracking-wide transition ${
      tab === value
        ? "border-ink bg-ink text-paper"
        : "border-ink/20 text-ink hover:border-ink"
    }`;

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border-2 border-ink/15 bg-white p-6 text-left"
    >
      <p className="font-display text-xl tracking-wide text-ink">
        LAISSEZ UNE TRACE
      </p>
      <p className="mt-1 text-sm text-ink/55">
        Un mot, une photo ou un petit dessin — affiché sur la page
        d&apos;accueil. Entièrement facultatif.
      </p>

      <label className="mt-5 block">
        <span className="font-mono text-xs uppercase tracking-[0.14em] text-red">
          Votre message
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

      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" className={tabBtn("none")} onClick={() => setTab("none")}>
          RIEN
        </button>
        <button type="button" className={tabBtn("photo")} onClick={() => setTab("photo")}>
          PHOTO
        </button>
        <button type="button" className={tabBtn("drawing")} onClick={() => setTab("drawing")}>
          DESSIN
        </button>
      </div>

      {tab === "photo" && (
        <div className="mt-4">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handlePhoto}
            className="block w-full text-sm text-ink/70 file:mr-4 file:rounded-full file:border-2 file:border-ink/20 file:bg-paper file:px-4 file:py-2 file:font-display file:text-sm file:tracking-wide"
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

      {tab === "drawing" && (
        <div className="mt-4">
          <DrawingCanvas ref={canvasRef} />
        </div>
      )}

      {errorMsg && <p className="mt-4 text-sm text-red">{errorMsg}</p>}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-5 rounded-full bg-red px-8 py-3.5 font-display text-base tracking-wide text-paper transition hover:bg-red-dark disabled:opacity-60"
      >
        {status === "sending" ? "ENVOI..." : "PUBLIER"}
      </button>
    </form>
  );
}
