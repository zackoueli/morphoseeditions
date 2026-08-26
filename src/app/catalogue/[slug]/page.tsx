import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getIssueBySlug } from "@/lib/data/issues";
import { AddToCartButton } from "@/components/catalogue/add-to-cart-button";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function IssuePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const issue = await getIssueBySlug(slug);
  if (!issue) notFound();

  return (
    <div className="bg-paper text-ink">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="font-mono text-sm text-ink/50">
              N°{issue.issueNumber}
            </p>
            <h1 className="mt-1 font-display text-5xl tracking-wide">
              {issue.title}
            </h1>
            <p className="mt-6 text-ink/70">{issue.description}</p>

            <div className="mt-8 flex items-center gap-6">
              <span className="font-display text-3xl text-red">
                {formatPrice(issue.priceCents)}
              </span>
              <span className="font-mono text-sm text-ink/50">
                {issue.stock > 0
                  ? `${issue.stock} exemplaire${issue.stock > 1 ? "s" : ""} en stock`
                  : "Rupture de stock"}
              </span>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <AddToCartButton issue={issue} />
              <Link
                href={`/lecture/${issue.slug}`}
                className="rounded-full border-2 border-ink px-8 py-4 font-display text-lg tracking-wide text-ink transition hover:border-red hover:text-red"
              >
                LIRE
              </Link>
            </div>

            <p className="mt-4 text-xs text-ink/40">
              Cette revue se feuillette gratuitement en ligne. L&apos;achat
              finance l&apos;impression papier et soutient l&apos;association.
            </p>
          </div>

          <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-lg border-2 border-ink/10 bg-ink/5">
            <Image
              src={issue.coverImageUrl}
              alt={`Couverture de ${issue.title}`}
              fill
              sizes="(min-width: 1024px) 40vw, 80vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
