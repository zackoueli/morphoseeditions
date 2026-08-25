import Image from "next/image";
import Link from "next/link";
import type { Issue } from "@/lib/types";
import { formatPrice } from "@/lib/format";

export function IssueCard({ issue }: { issue: Issue }) {
  const outOfStock = issue.stock <= 0;
  const buttonColor = issue.buttonColor || "#c81e1e";

  return (
    <Link
      href={`/catalogue/${issue.slug}`}
      className="group relative isolate flex min-h-[420px] items-center overflow-hidden rounded-lg border-4 border-paper bg-ink p-6 shadow-[0_8px_0_rgba(0,0,0,0.35)] transition hover:-translate-y-1 sm:p-8"
    >
      {issue.backgroundImageUrl && (
        <Image
          src={issue.backgroundImageUrl}
          alt=""
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      )}
      <div className="absolute inset-0 bg-ink/25 halftone-bg" />

      {outOfStock && (
        <span className="absolute right-5 top-5 z-20 rounded-full bg-red px-3 py-1 font-mono text-xs text-paper">
          Épuisé
        </span>
      )}

      <div className="relative z-10 flex w-full items-center gap-5 sm:gap-6">
        <div className="relative w-[38%] shrink-0 -rotate-3 transition duration-300 group-hover:rotate-0">
          <div className="relative aspect-[3/4] overflow-hidden rounded-sm border-2 border-ink/40 shadow-[0_14px_28px_rgba(0,0,0,0.55)]">
            <Image
              src={issue.coverImageUrl}
              alt={`Couverture de ${issue.title}`}
              fill
              sizes="(min-width: 1024px) 20vw, 40vw"
              className="object-cover"
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-center gap-3">
          <div className="inline-block self-start rounded bg-ink/90 px-4 py-2 shadow-lg">
            <h3 className="font-display text-4xl uppercase leading-[0.9] tracking-wide text-saffron sm:text-5xl">
              {issue.title}
              {issue.issueNumber ? ` N°${issue.issueNumber}` : ""}
            </h3>
          </div>

          <div className="rounded bg-ink/90 px-4 py-3 shadow-lg">
            <p className="font-display text-lg uppercase leading-tight tracking-wide text-paper sm:text-xl">
              {issue.description}
            </p>
          </div>

          {issue.description2 && (
            <p className="font-display text-base uppercase tracking-wide text-red drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] sm:text-lg">
              {issue.description2}
            </p>
          )}

          <span className="font-display text-xl tracking-wide text-paper drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] sm:text-2xl">
            {formatPrice(issue.priceCents)}
          </span>

          <span
            className="mt-1 flex w-full max-w-xs items-center justify-center rounded-md border-2 border-paper py-3 text-center font-display text-lg uppercase tracking-widest text-paper shadow-[0_5px_0_rgba(0,0,0,0.35)] transition group-hover:brightness-110 sm:text-xl"
            style={{ backgroundColor: buttonColor }}
          >
            Acheter/Lire
          </span>
        </div>
      </div>
    </Link>
  );
}
