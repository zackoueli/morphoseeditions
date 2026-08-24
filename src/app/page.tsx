import Link from "next/link";
import Image from "next/image";
import { getPublishedIssues } from "@/lib/data/issues";
import { IssueCard } from "@/components/catalogue/issue-card";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const issues = await getPublishedIssues();
  const latest = issues.slice(0, 3);

  const featured = latest[0];

  return (
    <>
      <section className="relative -mt-[73px] overflow-hidden border-b-2 border-paper/10 bg-ink">
        <div
          className="absolute inset-0 bg-cover bg-[center_20%]"
          style={{ backgroundImage: "url(/images/hero-background.png)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-l from-ink/55 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />

        <div className="relative flex min-h-screen items-center px-4 pt-16 sm:px-6">
          <div className="mx-auto grid w-full max-w-7xl items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
            <div>
              <span className="inline-block rounded-full border border-saffron/50 bg-ink/40 px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-saffron backdrop-blur-sm">
                Édition associative
              </span>
              <h1 className="mt-4 font-display text-5xl leading-[0.92] tracking-wide drop-shadow-[0_4px_16px_rgba(0,0,0,0.7)] sm:text-6xl">
                <span className="text-saffron">DES REVUES</span>
                <br />
                <span className="text-red">QUI SE PARTAGENT.</span>
              </h1>
              <p className="mt-5 max-w-sm text-sm text-paper/75 drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]">
                Morphose Éditions publie chaque année une revue collective de
                bandes dessinées et de poésie. Toutes nos publications se
                feuillettent gratuitement en ligne — et se soutiennent en
                papier.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/lecture"
                  className="rounded-full bg-red px-7 py-3.5 font-display text-base tracking-wide text-paper transition hover:bg-red-dark"
                >
                  ▶ LIRE EN LIGNE
                </Link>
                <Link
                  href="/a-propos"
                  className="rounded-full border-2 border-paper/50 px-7 py-3.5 font-display text-base tracking-wide text-paper transition hover:border-saffron hover:text-saffron"
                >
                  L&apos;ASSOCIATION
                </Link>
              </div>
            </div>

            <div className="hidden md:block md:w-[18vw] lg:w-[14vw]" aria-hidden />

            {featured && (
              <div className="justify-self-end">
                <Link
                  href={`/lecture/${featured.slug}`}
                  className="group block w-full max-w-[460px] overflow-hidden rounded-lg border border-paper/15 bg-ink/40 backdrop-blur-sm"
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden">
                    <Image
                      src={featured.coverImageUrl}
                      alt={featured.title}
                      fill
                      sizes="460px"
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <p className="font-display text-sm tracking-[0.25em] text-saffron">
                      DERNIER NUMÉRO
                    </p>
                    <p className="mt-1 font-display text-3xl tracking-wide text-paper">
                      {featured.title}
                    </p>
                    <p className="mt-2 font-display text-base tracking-widest text-red">
                      LIRE →
                    </p>
                  </div>
                </Link>
              </div>
            )}
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
