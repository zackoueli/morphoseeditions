"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "sent" | "error";

export function JoinAssociationForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          message: form.get("message"),
          type: "membership",
        }),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("sent");
      e.currentTarget.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <p className="rounded-lg border-2 border-teal bg-teal/10 p-6 text-teal">
        Message envoyé, merci ! On revient vers vous rapidement.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="font-display text-sm tracking-widest text-paper/60">
            NOM
          </span>
          <input
            name="name"
            required
            className="rounded-md border-2 border-paper/20 bg-ink/40 px-4 py-3 text-paper outline-none focus:border-red"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-display text-sm tracking-widest text-paper/60">
            E-MAIL
          </span>
          <input
            type="email"
            name="email"
            required
            className="rounded-md border-2 border-paper/20 bg-ink/40 px-4 py-3 text-paper outline-none focus:border-red"
          />
        </label>
      </div>
      <label className="flex flex-col gap-1">
        <span className="font-display text-sm tracking-widest text-paper/60">
          CE QUE VOUS POUVEZ APPORTER À L&apos;ASSOCIATION
        </span>
        <textarea
          name="message"
          required
          rows={5}
          placeholder="Illustration, écriture, mise en page, diffusion, événementiel, temps, matériel..."
          className="rounded-md border-2 border-paper/20 bg-ink/40 px-4 py-3 text-paper outline-none placeholder:text-paper/30 focus:border-red"
        />
      </label>
      {status === "error" && (
        <p className="text-sm text-red">
          Une erreur est survenue, réessayez ou écrivez-nous directement par
          e-mail.
        </p>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-2 self-start rounded-full bg-red px-8 py-4 font-display text-lg tracking-wide text-paper transition hover:bg-red-dark disabled:opacity-60"
      >
        {status === "sending" ? "ENVOI..." : "REJOINDRE L'ASSOCIATION"}
      </button>
    </form>
  );
}
