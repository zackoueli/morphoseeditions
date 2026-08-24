"use client";

import { use, useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import { IssueForm } from "@/components/admin/issue-form";
import type { Issue } from "@/lib/types";

export default function EditIssuePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [issue, setIssue] = useState<Issue | null>(null);

  useEffect(() => {
    adminFetch("/api/admin/issues")
      .then((res) => res.json())
      .then((issues: Issue[]) => setIssue(issues.find((i) => i.id === id) ?? null));
  }, [id]);

  return (
    <div>
      <h1 className="font-display text-3xl tracking-wide">MODIFIER LA REVUE</h1>
      <div className="mt-8">
        {issue ? (
          <IssueForm issue={issue} issueId={id} />
        ) : (
          <p className="text-ink/50">Chargement...</p>
        )}
      </div>
    </div>
  );
}
