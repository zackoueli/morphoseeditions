"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import type { Issue } from "@/lib/types";
import { formatPrice } from "@/lib/format";

export default function AdminIssuesPage() {
  const [issues, setIssues] = useState<Issue[] | null>(null);

  useEffect(() => {
    adminFetch("/api/admin/issues")
      .then((res) => res.json())
      .then(setIssues);
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl tracking-wide">REVUES</h1>
        <Link
          href="/admin/revues/nouvelle"
          className="rounded-full bg-red px-5 py-2 font-display text-sm tracking-wide text-paper hover:bg-red-dark"
        >
          + NOUVELLE REVUE
        </Link>
      </div>

      {!issues ? (
        <p className="mt-8 text-ink/50">Chargement...</p>
      ) : issues.length === 0 ? (
        <p className="mt-8 text-ink/50">Aucune revue pour l&apos;instant.</p>
      ) : (
        <table className="mt-8 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-ink/10 text-left text-ink/50">
              <th className="py-2">N°</th>
              <th className="py-2">Titre</th>
              <th className="py-2">Prix</th>
              <th className="py-2">Stock</th>
              <th className="py-2">Statut</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {issues.map((issue) => (
              <tr key={issue.id} className="border-b border-ink/5">
                <td className="py-3">{issue.issueNumber}</td>
                <td className="py-3 font-medium">{issue.title}</td>
                <td className="py-3">{formatPrice(issue.priceCents)}</td>
                <td className="py-3">{issue.stock}</td>
                <td className="py-3">
                  {issue.published ? (
                    <span className="text-teal">Publiée</span>
                  ) : (
                    <span className="text-ink/40">Brouillon</span>
                  )}
                </td>
                <td className="py-3 text-right">
                  <Link
                    href={`/admin/revues/${issue.id}`}
                    className="text-red hover:underline"
                  >
                    Modifier
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
