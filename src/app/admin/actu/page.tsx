"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import type { NewsPost } from "@/lib/types";

export default function AdminNewsPage() {
  const [posts, setPosts] = useState<NewsPost[] | null>(null);

  useEffect(() => {
    adminFetch("/api/admin/news")
      .then((res) => res.json())
      .then(setPosts);
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl tracking-wide">ACTUALITÉS</h1>
        <Link
          href="/admin/actu/nouvelle"
          className="rounded-full bg-red px-5 py-2 font-display text-sm tracking-wide text-paper hover:bg-red-dark"
        >
          + NOUVEL ARTICLE
        </Link>
      </div>

      {!posts ? (
        <p className="mt-8 text-ink/50">Chargement...</p>
      ) : posts.length === 0 ? (
        <p className="mt-8 text-ink/50">Aucun article pour l&apos;instant.</p>
      ) : (
        <ul className="mt-8 flex flex-col divide-y divide-ink/10">
          {posts.map((post) => (
            <li key={post.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">{post.title}</p>
                <p className="text-xs text-ink/40">
                  {post.published ? "Publié" : "Brouillon"} —{" "}
                  {new Date(post.publishedAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <Link
                href={`/admin/actu/${post.id}`}
                className="text-sm text-red hover:underline"
              >
                Modifier
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
