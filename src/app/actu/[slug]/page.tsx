import { notFound } from "next/navigation";
import Image from "next/image";
import { getNewsBySlug } from "@/lib/data/news";
import { NewsCarousel } from "@/components/actu/news-carousel";

export const dynamic = "force-dynamic";

export default async function NewsPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getNewsBySlug(slug);
  if (!post) notFound();

  const carouselImages = [
    ...(post.coverImageUrl ? [post.coverImageUrl] : []),
    ...(post.galleryImageUrls ?? []),
  ];

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
        {carouselImages.length === 1 ? (
          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-lg">
            <Image
              src={carouselImages[0]}
              alt=""
              fill
              sizes="(min-width: 768px) 768px, 100vw"
              className="object-cover"
            />
          </div>
        ) : (
          <NewsCarousel images={carouselImages} title={post.title} />
        )}
        <div className="prose prose-neutral mt-8 max-w-none whitespace-pre-wrap">
          {post.content}
        </div>
      </div>
    </div>
  );
}
