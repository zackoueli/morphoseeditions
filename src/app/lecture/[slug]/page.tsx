import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getIssueBySlug, getPublishedIssues } from "@/lib/data/issues";
import { FlipbookViewer } from "@/components/catalogue/flipbook-viewer";
import { AddToCartButton } from "@/components/catalogue/add-to-cart-button";
import { formatPrice } from "@/lib/format";
import { SHIPPING_FLAT_RATE_CENTS } from "@/lib/stripe";

// Page mise en cache ; rafraîchie à chaque modification (cf. lib/revalidate.ts).
export const revalidate = 300;

export async function generateStaticParams() {
  const issues = await getPublishedIssues().catch(() => []);
  return issues.map((issue) => ({ slug: issue.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const issue = await getIssueBySlug(slug);
  if (!issue) return {};

  const title = `Lire ${issue.title} en ligne — Morphose Éditions`;
  const description = `Feuilletez gratuitement ${issue.title} en ligne. ${issue.description}`;
  return {
    title,
    description,
    alternates: { canonical: `/lecture/${issue.slug}` },
    openGraph: {
      title,
      description,
      url: `/lecture/${issue.slug}`,
      siteName: "Morphose Éditions",
      locale: "fr_FR",
      type: "website",
      images: [{ url: issue.coverImageUrl, alt: `Couverture de ${issue.title}` }],
    },
  };
}

export default async function LectureIssuePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const issue = await getIssueBySlug(slug);
  if (!issue) notFound();

  return (
    <div className="bg-paper text-ink">
      <div className="mx-auto max-w-5xl px-4 pt-10 sm:px-6">
        <Link
          href="/lecture"
          className="font-display text-xs tracking-widest text-ink/50 hover:text-red"
        >
          ← TOUTES LES REVUES
        </Link>
        <h1 className="mt-4 font-display text-4xl tracking-wide sm:text-5xl">
          {issue.title}
        </h1>
      </div>

      <div className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6">
        <FlipbookViewer
          pageImageUrls={issue.pageImageUrls}
          title={issue.title}
          fullscreen
        />
      </div>

      <div className="border-t-2 border-ink/10 bg-white">
        <div className="mx-auto grid max-w-5xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-[auto_1fr] md:items-center">
          <div className="relative mx-auto h-40 w-32 overflow-hidden rounded-lg border-2 border-ink/10 shadow-lg sm:h-48 sm:w-36">
            <Image
              src={issue.coverImageUrl}
              alt={`Couverture de ${issue.title}`}
              fill
              sizes="144px"
              className="object-cover"
            />
          </div>

          <div className="text-center md:text-left">
            <h2 className="font-display text-2xl tracking-wide sm:text-3xl">
              SOUTENEZ MORPHOSE EN COMMANDANT L&apos;EXEMPLAIRE PAPIER
            </h2>
            <p className="mt-3 max-w-xl text-ink/60">
              {issue.description}
            </p>

            <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row md:justify-start">
              <span className="font-display text-2xl text-red">
                {formatPrice(issue.priceCents)}
              </span>
              <span className="font-mono text-sm text-ink/50">
                {issue.stock > 0
                  ? `${issue.stock} exemplaire${issue.stock > 1 ? "s" : ""} en stock`
                  : "Rupture de stock"}
              </span>
              <AddToCartButton issue={issue} />
            </div>
            <p className="mt-3 text-sm text-ink/60">
              + {formatPrice(SHIPPING_FLAT_RATE_CENTS)} de livraison en point
              relais Mondial Relay · expédié sous 1 à 3 jours ouvrés · paiement
              sécurisé par Stripe
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
