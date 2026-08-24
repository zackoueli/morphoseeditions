"use client";

import { use, useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import { NewsForm } from "@/components/admin/news-form";
import type { NewsPost } from "@/lib/types";

export default function EditNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [post, setPost] = useState<NewsPost | null>(null);

  useEffect(() => {
    adminFetch("/api/admin/news")
      .then((res) => res.json())
      .then((posts: NewsPost[]) => setPost(posts.find((p) => p.id === id) ?? null));
  }, [id]);

  return (
    <div>
      <h1 className="font-display text-3xl tracking-wide">MODIFIER L&apos;ARTICLE</h1>
      <div className="mt-8">
        {post ? (
          <NewsForm post={post} postId={id} />
        ) : (
          <p className="text-ink/50">Chargement...</p>
        )}
      </div>
    </div>
  );
}
