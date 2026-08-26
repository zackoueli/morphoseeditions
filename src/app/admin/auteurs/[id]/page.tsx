"use client";

import { use, useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import { AuthorForm } from "@/components/admin/author-form";
import type { Author } from "@/lib/types";

export default function EditAuthorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [author, setAuthor] = useState<Author | null>(null);

  useEffect(() => {
    adminFetch("/api/admin/authors")
      .then((res) => res.json())
      .then((authors: Author[]) => setAuthor(authors.find((a) => a.id === id) ?? null));
  }, [id]);

  return (
    <div>
      <h1 className="font-display text-3xl tracking-wide">MODIFIER L&apos;AUTEUR</h1>
      <div className="mt-8">
        {author ? (
          <AuthorForm author={author} authorId={id} />
        ) : (
          <p className="text-ink/50">Chargement...</p>
        )}
      </div>
    </div>
  );
}
