import Link from "next/link";
import Image from "next/image";
import { getPublishedIssues } from "@/lib/data/issues";
import { IssueCard } from "@/components/catalogue/issue-card";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const issues = await getPublishedIssues();
  const latest = issues.slice(0, 3);

  return (
    <>
      <section className="relative -mt-[73px] overflow-hidden border-b-2 border-paper/10 bg-ink">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/pexels-introspectivedsgn-7524996.jpg)" }}
        />
        <div className="absolute inset-0 bg-ink/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-ink/50" />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 pb-24 pt-40 text-center sm:px-6 md:pb-36 md:pt-48">
          <p className="font-marker text-3xl text-saffron">
            Édition associative &amp; lecture libre
          </p>
          <h1 className="font-display text-6xl leading-[0.95] tracking-wide text-paper drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] sm:text-8xl">
            DES REVUES
            <br />
            <span className="text-red">QUI SE PARTAGENT.</span>
          </h1>
          <p className="max-w-xl text-lg text-paper/80 drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]">
            Morphose Éditions publie chaque année une revue collective de
            bandes dessinées et de poésie. Toutes nos publications se
            feuillettent gratuitement en ligne — et se soutiennent en papier.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            <Link
              href="/catalogue"
              className="rounded-full bg-red px-8 py-4 font-display text-lg tracking-wide text-paper transition hover:bg-red-dark"
            >
              VOIR LE CATALOGUE
            </Link>
            <Link
              href="/soutenir"
              className="rounded-full border-2 border-paper/50 px-8 py-4 font-display text-lg tracking-wide text-paper transition hover:border-saffron hover:text-saffron"
            >
              SOUTENIR L&apos;ASSO
            </Link>
          </div>
        </div>
        <div className="torn-edge relative h-4 bg-ink" />
      </section>

      <section className="bg-paper text-ink">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="mb-10 flex items-end justify-between">
            <h2 className="font-display text-4xl tracking-wide">
              DERNIÈRES SORTIES
            </h2>
            <Link
              href="/catalogue"
              className="font-display text-sm tracking-widest text-red hover:underline"
            >
              TOUT LE CATALOGUE →
            </Link>
          </div>

          {latest.length === 0 ? (
            <p className="text-ink/60">
              Le catalogue est en cours de préparation — revenez bientôt.
            </p>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {latest.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="border-t-2 border-paper/10 bg-ink">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 md:grid-cols-2 md:items-center">
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg border-2 border-paper/10">
            <Image
              src="/images/about-placeholder.svg"
              alt="Membres de l'association en atelier"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <p className="font-marker text-2xl text-saffron">L&apos;association</p>
            <h2 className="mt-2 font-display text-4xl tracking-wide text-paper">
              UN COLLECTIF, PAS UNE MAISON D&apos;ÉDITION COMME LES AUTRES
            </h2>
            <p className="mt-4 text-paper/70">
              Morphose Éditions est une association loi 1901 portée par des
              auteur·rice·s, illustrateur·rice·s et poètes. Chaque revue est
              une œuvre collective, imprimée en petite série et diffusée sans
              barrière numérique : nos PDF sont en accès libre pour tout le
              monde, dès leur sortie.
            </p>
            <Link
              href="/a-propos"
              className="mt-6 inline-block font-display text-sm tracking-widest text-red hover:underline"
            >
              DÉCOUVRIR L&apos;ASSOCIATION →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
