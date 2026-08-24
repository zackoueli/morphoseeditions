import Link from "next/link";
import Image from "next/image";
import { getPublishedIssues } from "@/lib/data/issues";

export const metadata = { title: "Lecture — Morphose Éditions" };
export const dynamic = "force-dynamic";

export default async function LecturePage() {
  const issues = await getPublishedIssues();

  return (
    <div className="bg-paper text-ink">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <p className="font-marker text-2xl text-red">Lecture libre</p>
        <h1 className="mt-2 font-display text-5xl tracking-wide">LECTURE</h1>
        <p className="mt-4 max-w-2xl text-ink/60">
          Toutes nos revues se feuillettent gratuitement en ligne, dès leur
          sortie. Choisissez un numéro pour l&apos;ouvrir directement dans le
          lecteur.
        </p>

        {issues.length === 0 ? (
          <p className="mt-16 text-ink/50">
            Le catalogue est en cours de préparation.
          </p>
        ) : (
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {issues.map((issue) => (
              <Link
                key={issue.id}
                href={`/lecture/${issue.slug}`}
                className="group flex flex-col overflow-hidden rounded-lg border-2 border-ink/10 bg-white transition hover:-translate-y-1 hover:border-red"
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
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <h2 className="font-display text-2xl tracking-wide text-ink">
                    {issue.title}
                  </h2>
                  <span className="mt-auto font-display text-xs tracking-widest text-red">
                    OUVRIR LE FEUILLETEUR →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
