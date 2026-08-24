import Image from "next/image";
import Link from "next/link";
import type { Issue } from "@/lib/types";
import { formatPrice } from "@/lib/format";

export function IssueCard({ issue }: { issue: Issue }) {
  const outOfStock = issue.stock <= 0;

  return (
    <Link
      href={`/catalogue/${issue.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border-2 border-ink/10 bg-paper transition hover:-translate-y-1 hover:border-red"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-ink/5">
        <Image
          src={issue.coverImageUrl}
          alt={`Couverture de ${issue.title}`}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-300 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-ink px-3 py-1 font-mono text-xs text-paper">
          N°{issue.issueNumber}
        </span>
        {outOfStock && (
          <span className="absolute right-3 top-3 rounded-full bg-red px-3 py-1 font-mono text-xs text-paper">
            Épuisé
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="font-display text-2xl tracking-wide text-ink">
          {issue.title}
        </h3>
        <p className="line-clamp-2 flex-1 text-sm text-ink/60">
          {issue.description}
        </p>
        <div className="flex items-center justify-between pt-2">
          <span className="font-display text-lg text-red">
            {formatPrice(issue.priceCents)}
          </span>
          <span className="font-display text-xs tracking-widest text-ink/50">
            LIRE EN LIGNE →
          </span>
        </div>
      </div>
    </Link>
  );
}
