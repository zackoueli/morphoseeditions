import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { getNewsBySlug, getPublishedNews } from "@/lib/data/news";
import { NewsCarousel } from "@/components/actu/news-carousel";

// Page mise en cache ; rafraîchie à chaque modification (cf. lib/revalidate.ts).
export const revalidate = 300;

export async function generateStaticParams() {
  const posts = await getPublishedNews().catch(() => []);
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getNewsBySlug(slug);
  if (!post) return {};

  const title = `${post.title} — Morphose Éditions`;
  const description = post.excerpt || undefined;
  return {
    title,
    description,
    alternates: { canonical: `/actu/${post.slug}` },
    openGraph: {
      title,
      description,
      url: `/actu/${post.slug}`,
      siteName: "Morphose Éditions",
      locale: "fr_FR",
      type: "article",
      publishedTime: new Date(post.publishedAt).toISOString(),
      images: post.coverImageUrl ? [{ url: post.coverImageUrl }] : undefined,
    },
  };
}

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
