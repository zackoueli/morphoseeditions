import { notFound } from "next/navigation";
import Image from "next/image";
import { getNewsBySlug } from "@/lib/data/news";

export const dynamic = "force-dynamic";

export default async function NewsPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getNewsBySlug(slug);
  if (!post) notFound();

  return (
    <div className="bg-paper text-ink">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <p className="font-mono text-xs text-ink/40">
          {new Date(post.publishedAt).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        <h1 className="mt-2 font-display text-4xl tracking-wide">
          {post.title}
        </h1>
        {post.coverImageUrl && (
          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-lg">
            <Image src={post.coverImageUrl} alt="" fill className="object-cover" />
          </div>
        )}
        <div className="prose prose-neutral mt-8 max-w-none whitespace-pre-wrap">
          {post.content}
        </div>
      </div>
    </div>
  );
}
