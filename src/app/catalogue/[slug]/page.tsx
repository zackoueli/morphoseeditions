import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";
import { getIssueBySlug, getPublishedIssues } from "@/lib/data/issues";
import { pickPreviewPages } from "@/lib/issue-previews";
import { isReadableOnline } from "@/lib/issue-utils";
import { AddToCartButton } from "@/components/catalogue/add-to-cart-button";
import { StickyBuyBar } from "@/components/catalogue/sticky-buy-bar";
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
  const description = isReadableOnline(issue)
    ? `${issue.description} — Exemplaire papier ${formatPrice(issue.priceCents)}, lecture gratuite en ligne.`
    : `${issue.description} — ${formatPrice(issue.priceCents)}.`;
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

const BUY_ANCHOR_ID = "achat";
const INSIDE_ANCHOR_ID = "interieur";

/**
 * Pages intérieures montrées sur la fiche : celles enregistrées avec la revue
 * (choisies dans le back-office, ou automatiquement à l'enregistrement).
 * Pour une revue enregistrée avant l'existence de ce champ, le choix
 * automatique est fait ici et gardé en cache.
 */
async function previewPageUrls(issue: Issue): Promise<string[]> {
  const urls = issue.pageImageUrls ?? [];
  if (urls.length === 0) return [];

  const stored = issue.previewPages ?? [];
  const pages =
    stored.length > 0
      ? stored
      : await unstable_cache(
          () => pickPreviewPages(urls),
          ["issue-preview-pages", issue.id, String(urls.length), urls[1] ?? ""]
        )();
  return pages.map((n) => urls[n - 1]).filter(Boolean);
}

/** Lignes du tableau de caractéristiques : uniquement des informations que l'on connaît. */
function specRows(issue: Issue): { label: string; value: string }[] {
  const pageCount = issue.pageImageUrls?.length ?? 0;
  const inStock = issue.stock > 0;
  return [
    { label: "Éditeur", value: "Morphose Éditions, association" },
    ...(pageCount > 0
      ? [{ label: "Nombre de pages", value: String(pageCount) }]
      : []),
    ...(isReadableOnline(issue)
      ? [{ label: "Lecture en ligne", value: "Gratuite, en intégralité" }]
      : []),
    ...(inStock
      ? [
          {
            label: "Exemplaires restants",
            value: String(issue.stock),
          },
          {
            label: "Livraison",
            value: `Point relais Mondial Relay, ${formatPrice(SHIPPING_FLAT_RATE_CENTS)} par commande`,
          },
          { label: "Paiement", value: "Carte bancaire, sans création de compte" },
          { label: "Retour", value: "14 jours pour changer d'avis" },
        ]
      : []),
  ];
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

function PaperIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
      <path
        d="M5 4.5h11.5a2.5 2.5 0 0 1 2.5 2.5v12.5H7.5A2.5 2.5 0 0 1 5 17V4.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M5 17a2.5 2.5 0 0 1 2.5-2.5H19" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8.5 8h7M8.5 11h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ScreenIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
      <rect x="6.5" y="3.5" width="11" height="17" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10.5 17.5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default async function IssuePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const issue = await getIssueBySlug(slug);
  if (!issue) notFound();

  const inStock = issue.stock > 0;
  const lowStock = inStock && issue.stock <= 10;
  const readable = isReadableOnline(issue);
  // Les extraits renvoient vers le feuilleteur : uniquement pour ce qui se lit en ligne.
  const previews = readable ? await previewPageUrls(issue) : [];
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

      <div className="mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6 lg:pt-12">
        <Link
          href="/catalogue"
          className="inline-block border-b border-ink/40 pb-1 text-sm text-ink/70 transition hover:border-red hover:text-red"
        >
          ← Retour au catalogue
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,460px)_minmax(0,1fr)] lg:gap-16">
          {/* Formats + couverture */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-0">
            {/* Le choix papier / en ligne n'a de sens que pour ce qui se lit en ligne. */}
            {readable && (
              <div className="order-2 grid grid-cols-2 gap-3 sm:order-1 sm:flex sm:w-28 sm:shrink-0 sm:flex-col sm:gap-0">
                <div className="bg-saffron px-4 py-5">
                  <PaperIcon />
                  <p className="mt-3 text-sm">Papier</p>
                  <p className="font-semibold">{formatPrice(issue.priceCents)}</p>
                </div>
                <Link
                  href={`/lecture/${issue.slug}`}
                  className="px-4 py-5 text-ink/70 transition hover:bg-paper-dim hover:text-ink"
                >
                  <ScreenIcon />
                  <p className="mt-3 text-sm">En ligne</p>
                  <p className="font-semibold">Gratuit</p>
                </Link>
              </div>
            )}

            <div className="relative order-1 mx-auto w-[70%] max-w-xs sm:order-2 sm:mx-0 sm:w-[348px] sm:max-w-full">
              {(lowStock || !inStock) && (
                <span className="absolute -right-3 -top-3 z-10 border border-saffron bg-paper px-3 py-1 text-sm">
                  {inStock ? `Plus que ${issue.stock}` : "Épuisé"}
                </span>
              )}
              {/* Hauteur libre : les couvertures n'ont pas toutes le même format, on ne les rogne pas. */}
              <Image
                src={issue.coverImageUrl}
                alt={`Couverture de ${issue.title}`}
                width={768}
                height={960}
                preload
                sizes="(min-width: 1024px) 350px, 70vw"
                className="h-auto w-full shadow-[0_18px_40px_rgba(13,9,6,0.28)]"
              />
            </div>
          </div>

          {/* Informations */}
          <div className="flex flex-col">
            <h1 className="font-display text-4xl leading-tight tracking-wide sm:text-5xl">
              {issue.title}
            </h1>
            <p className="mt-3 text-saffron">Par Morphose Éditions</p>

            <p className="mt-6 max-w-xl text-ink/75">{issue.description}</p>
            {issue.description2 && (
              <p className="mt-2 max-w-xl text-sm text-ink/60">
                {issue.description2}
              </p>
            )}

            <dl className="mt-8 grid max-w-xl grid-cols-[minmax(0,10rem)_minmax(0,1fr)] gap-x-6 gap-y-2.5 text-sm">
              {specRows(issue).map((row) => (
                <div key={row.label} className="contents">
                  <dt className="font-semibold">{row.label}</dt>
                  <dd className="text-ink/75">{row.value}</dd>
                </div>
              ))}
            </dl>

            {previews.length > 0 && (
              <div className="mt-6 flex items-center gap-4">
                <a
                  href={`#${INSIDE_ANCHOR_ID}`}
                  className="shrink-0 text-sm text-ink/70 transition hover:text-red"
                >
                  Voir l&apos;intérieur ↓
                </a>
                <span className="h-px flex-1 bg-ink/15" aria-hidden />
              </div>
            )}

            <div
              id={BUY_ANCHOR_ID}
              className="mt-10 flex flex-wrap items-end justify-between gap-x-6 gap-y-5 lg:mt-auto lg:pt-10"
            >
              <div className="text-sm">
                <p className={inStock ? "text-saffron" : "text-red"}>
                  {inStock ? "Disponible" : "Épuisé"}
                </p>
                <p className="mt-1 max-w-[12rem] text-ink/70">
                  {inStock
                    ? "Expédié sous 1 à 3 jours ouvrés, en point relais."
                    : readable
                      ? "L'exemplaire papier n'est plus disponible pour le moment."
                      : "Ce produit n'est plus disponible pour le moment."}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-5">
                <span className="font-display text-3xl">
                  {formatPrice(issue.priceCents)}
                </span>
                <AddToCartButton issue={issue} />
              </div>
            </div>
          </div>
        </div>

        {previews.length > 0 && (
          <section
            id={INSIDE_ANCHOR_ID}
            className="mt-20 scroll-mt-24 border-t border-ink/15 pt-12"
          >
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-3xl tracking-wide">
                  À l&apos;intérieur
                </h2>
                <p className="mt-2 max-w-xl text-sm text-ink/70">
                  Quelques pages de la revue. Elle se feuillette gratuitement
                  en ligne, en entier, avant de commander.
                </p>
              </div>
              <Link
                href={`/lecture/${issue.slug}`}
                className="border-b border-ink/40 pb-1 text-sm text-ink/70 transition hover:border-red hover:text-red"
              >
                Feuilleter toute la revue →
              </Link>
            </div>

            <div className="-mx-4 mt-8 flex snap-x gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-6">
              {previews.map((url, i) => (
                <Link
                  key={url}
                  href={`/lecture/${issue.slug}`}
                  className="relative aspect-[4/5] w-[58vw] shrink-0 snap-center overflow-hidden bg-white shadow-[0_6px_18px_rgba(13,9,6,0.14)] transition hover:shadow-[0_10px_26px_rgba(13,9,6,0.26)] sm:w-auto"
                >
                  <Image
                    src={url}
                    alt={`Page intérieure de ${issue.title}, extrait ${i + 1}`}
                    fill
                    sizes="(min-width: 1024px) 180px, (min-width: 640px) 33vw, 58vw"
                    className="object-cover"
                  />
                </Link>
              ))}
            </div>
          </section>
        )}

        {otherIssues.length > 0 && (
          <section className="mt-20 border-t border-ink/15 pt-12">
            <h2 className="font-display text-3xl tracking-wide">
              Les autres numéros
            </h2>
            <p className="mt-2 text-sm text-ink/70">
              Les frais de port restent à {formatPrice(SHIPPING_FLAT_RATE_CENTS)}{" "}
              pour toute la commande.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
              {otherIssues.map((other) => (
                <Link
                  key={other.id}
                  href={`/catalogue/${other.slug}`}
                  className="group"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-white shadow-[0_6px_18px_rgba(13,9,6,0.14)] transition group-hover:shadow-[0_10px_26px_rgba(13,9,6,0.26)]">
                    <Image
                      src={other.coverImageUrl}
                      alt={`Couverture de ${other.title}`}
                      fill
                      sizes="(min-width: 1024px) 260px, 45vw"
                      className="object-cover"
                    />
                  </div>
                  <p className="mt-4 font-display text-xl tracking-wide group-hover:text-red">
                    {other.title}
                  </p>
                  <p className="mt-1 text-sm text-ink/70">
                    {other.stock > 0 ? formatPrice(other.priceCents) : "Épuisé"}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <StickyBuyBar issue={issue} anchorId={BUY_ANCHOR_ID} />
    </div>
  );
}
