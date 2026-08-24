import Link from "next/link";
import { notFound } from "next/navigation";
import { getIssueBySlug } from "@/lib/data/issues";
import { FlipbookViewer } from "@/components/catalogue/flipbook-viewer";
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

            <div className="mt-6">
              <AddToCartButton issue={issue} />
            </div>

            <p className="mt-4 text-xs text-ink/40">
              Le PDF de cette revue est en lecture libre et gratuite
              ci-contre. L&apos;achat finance l&apos;impression papier et
              soutient l&apos;association.
            </p>
          </div>

          <div>
            <FlipbookViewer
              pageImageUrls={issue.pageImageUrls}
              title={issue.title}
            />
            <div className="mt-4 text-center">
              <Link
                href={`/lecture/${issue.slug}`}
                className="font-display text-sm tracking-widest text-red hover:underline"
              >
                OUVRIR EN PLEIN ÉCRAN →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
