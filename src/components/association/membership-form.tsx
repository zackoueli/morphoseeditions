"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "sent" | "error";

const fieldClass =
  "rounded-md border-2 border-ink/15 bg-white px-4 py-3 outline-none focus:border-red";
const labelClass = "font-display text-sm tracking-widest text-ink/60";

export function MembershipForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.get("firstName"),
          lastName: form.get("lastName"),
          birthDate: form.get("birthDate"),
          email: form.get("email"),
          phone: form.get("phone"),
          address: form.get("address"),
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
        Demande d&apos;adhésion envoyée, merci ! Nous revenons vers vous
        rapidement.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className={labelClass}>PRÉNOM</span>
          <input name="firstName" required className={fieldClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className={labelClass}>NOM</span>
          <input name="lastName" required className={fieldClass} />
        </label>
      </div>
      <label className="flex flex-col gap-1">
        <span className={labelClass}>DATE DE NAISSANCE</span>
        <input type="date" name="birthDate" required className={fieldClass} />
      </label>
      <label className="flex flex-col gap-1">
        <span className={labelClass}>E-MAIL</span>
        <input type="email" name="email" required className={fieldClass} />
      </label>
      <label className="flex flex-col gap-1">
        <span className={labelClass}>TÉLÉPHONE (FACULTATIF)</span>
        <input type="tel" name="phone" className={fieldClass} />
      </label>
      <label className="flex flex-col gap-1">
        <span className={labelClass}>ADRESSE (FACULTATIF)</span>
        <textarea name="address" rows={3} className={fieldClass} />
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
        {status === "sending" ? "ENVOI..." : "ADHÉRER À L'ASSOCIATION"}
      </button>
    </form>
  );
}
