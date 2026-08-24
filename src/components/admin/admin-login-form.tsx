"use client";

import { useState } from "react";
import { useAdminAuth } from "@/components/admin/admin-auth-context";

export function AdminLoginForm() {
  const { login } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch {
      setError("Identifiants incorrects.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-sm flex-col gap-4 rounded-lg border-2 border-ink/10 p-8"
    >
      <h1 className="font-display text-2xl tracking-wide">
        ADMINISTRATION
      </h1>
      <input
        type="email"
        placeholder="E-mail"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded-md border-2 border-ink/15 px-4 py-3 outline-none focus:border-red"
      />
      <input
        type="password"
        placeholder="Mot de passe"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="rounded-md border-2 border-ink/15 px-4 py-3 outline-none focus:border-red"
      />
      {error && <p className="text-sm text-red">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-red px-6 py-3 font-display tracking-wide text-paper hover:bg-red-dark disabled:opacity-60"
      >
        {loading ? "CONNEXION..." : "SE CONNECTER"}
      </button>
    </form>
  );
}
