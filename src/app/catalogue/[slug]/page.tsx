import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getIssueBySlug, getPublishedIssues } from "@/lib/data/issues";
import { AddToCartButton } from "@/components/catalogue/add-to-cart-button";
import { formatPrice } from "@/lib/format";
import { SHIPPING_FLAT_RATE_CENTS } from "@/lib/stripe";
import type { Issue } from "@/lib/types";

// Page mise en cache ; rafraîchie à chaque modification (cf. lib/revalidate.ts).
export const revalidate = 300;

const SITE_URL = "https://www.morphoseeditions.fr";

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

  const title = `${issue.title} — Morphose Éditions`;
  const description = `${issue.description} — Exemplaire papier ${formatPrice(issue.priceCents)}, lecture gratuite en ligne.`;
  return {
    title,
    description,
    alternates: { canonical: `/catalogue/${issue.slug}` },
    openGraph: {
      title,
      description,
      url: `/catalogue/${issue.slug}`,
      siteName: "Morphose Éditions",
      locale: "fr_FR",
      type: "website",
      images: [{ url: issue.coverImageUrl, alt: `Couverture de ${issue.title}` }],
    },
  };
}

/** Quelques pages intérieures réparties dans la revue (la première image est la couverture). */
function previewPages(pageImageUrls: string[], count = 4) {
  const inner = pageImageUrls.slice(1);
  if (inner.length <= count) return inner;
  return Array.from(
    { length: count },
    (_, i) => inner[Math.floor(((i + 0.5) * inner.length) / count)]
  );
}

function productJsonLd(issue: Issue) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: issue.title,
    description: issue.description,
    image: issue.coverImageUrl,
    brand: { "@type": "Organization", name: "Morphose Éditions" },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/catalogue/${issue.slug}`,
      price: (issue.priceCents / 100).toFixed(2),
      priceCurrency: "EUR",
      availability:
        issue.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: (SHIPPING_FLAT_RATE_CENTS / 100).toFixed(2),
          currency: "EUR",
        },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "FR" },
      },
    },
  };
}

export default async function IssuePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const issue = await getIssueBySlug(slug);
  if (!issue) notFound();

  const previews = previewPages(issue.pageImageUrls ?? []);
  const otherIssues = (await getPublishedIssues())
    .filter((other) => other.id !== issue.id)
    .slice(0, 3);

  return (
    <div className="bg-paper text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd(issue)).replace(/</g, "\\u003c"),
        }}
      />
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <h1 className="font-display text-5xl tracking-wide">
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
            <p className="mt-2 text-sm text-ink/60">
              + {formatPrice(SHIPPING_FLAT_RATE_CENTS)} de livraison en point
              relais Mondial Relay, quel que soit le nombre de revues.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <AddToCartButton issue={issue} />
              <Link
                href={`/lecture/${issue.slug}`}
                className="rounded-full border-2 border-ink px-8 py-4 font-display text-lg tracking-wide text-ink transition hover:border-red hover:text-red"
              >
                LIRE
              </Link>
            </div>

            <ul className="mt-6 flex flex-col gap-2 border-l-2 border-ink/10 pl-4 text-sm text-ink/70">
              <li>Expédié sous 1 à 3 jours ouvrés, avec e-mail de suivi</li>
              <li>Paiement sécurisé par Stripe, sans création de compte</li>
              <li>
                14 jours pour changer d&apos;avis (
                <Link href="/cgv" className="underline hover:text-red">
                  conditions
                </Link>
                )
              </li>
              <li>
                Une question ?{" "}
                <Link href="/contact" className="underline hover:text-red">
                  Écrivez-nous
                </Link>
                , une personne de l&apos;association vous répond.
              </li>
            </ul>

            <p className="mt-6 text-xs text-ink/40">
              Cette revue se feuillette gratuitement en ligne. L&apos;achat
              finance l&apos;impression papier et soutient l&apos;association.
            </p>
          </div>

          <div>
            <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-lg border-2 border-ink/10 bg-ink/5">
              <Image
                src={issue.coverImageUrl}
                alt={`Couverture de ${issue.title}`}
                fill
                sizes="(min-width: 1024px) 40vw, 80vw"
                className="object-cover"
              />
            </div>

            {previews.length > 0 && (
              <div className="mx-auto mt-6 max-w-sm">
                <p className="font-display text-xs tracking-widest text-ink/50">
                  À L&apos;INTÉRIEUR
                </p>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {previews.map((url, i) => (
                    <Link
                      key={url}
                      href={`/lecture/${issue.slug}`}
                      className="relative aspect-[3/4] overflow-hidden rounded border border-ink/10 bg-ink/5 transition hover:border-red"
                    >
                      <Image
                        src={url}
                        alt={`Extrait ${i + 1} de ${issue.title}`}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </Link>
                  ))}
                </div>
                <Link
                  href={`/lecture/${issue.slug}`}
                  className="mt-3 inline-block font-display text-xs tracking-widest text-red hover:underline"
                >
                  FEUILLETER TOUTE LA REVUE →
                </Link>
              </div>
            )}
          </div>
        </div>

        {otherIssues.length > 0 && (
          <section className="mt-20 border-t-2 border-ink/10 pt-10">
            <h2 className="font-display text-3xl tracking-wide">
              LES AUTRES NUMÉROS
            </h2>
            <p className="mt-2 text-sm text-ink/60">
              Les frais de port restent à {formatPrice(SHIPPING_FLAT_RATE_CENTS)}{" "}
              pour toute la commande.
            </p>
            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              {otherIssues.map((other) => (
                <Link
                  key={other.id}
                  href={`/catalogue/${other.slug}`}
                  className="group flex items-center gap-4 rounded-lg border-2 border-ink/10 bg-white p-4 transition hover:border-red"
                >
                  <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded bg-ink/5">
                    <Image
                      src={other.coverImageUrl}
                      alt={`Couverture de ${other.title}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-display text-xl tracking-wide group-hover:text-red">
                      {other.title}
                    </p>
                    <p className="mt-1 text-sm text-ink/60">
                      {other.stock > 0 ? formatPrice(other.priceCents) : "Épuisé"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
