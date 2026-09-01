import Link from "next/link";
import Image from "next/image";
import { getPublishedNews } from "@/lib/data/news";

export const metadata = { title: "Actu — Morphose Éditions" };
export const dynamic = "force-dynamic";

export default async function ActuPage() {
  const posts = await getPublishedNews();

  return (
    <div className="bg-paper text-ink">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <h1 className="font-display text-5xl tracking-wide">ACTU</h1>

        {posts.length === 0 ? (
          <p className="mt-16 text-ink/50">Aucune actualité pour le moment.</p>
        ) : (
          <div className="mt-12 flex flex-col divide-y divide-ink/10">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/actu/${post.slug}`}
                className="group grid gap-6 py-8 sm:grid-cols-[200px_1fr]"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-ink/5">
                  {post.coverImageUrl && (
                    <Image
                      src={post.coverImageUrl}
                      alt=""
                      fill
                      className="object-cover transition group-hover:scale-105"
                    />
                  )}
                </div>
                <div>
                  <p className="font-mono text-xs text-ink/40">
                    {new Date(post.publishedAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <h2 className="mt-1 font-display text-2xl tracking-wide group-hover:text-red">
                    {post.title}
                  </h2>
                  <p className="mt-2 text-ink/60">{post.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
