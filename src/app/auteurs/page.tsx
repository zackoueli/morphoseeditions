import Link from "next/link";
import Image from "next/image";
import { getPublishedAuthors } from "@/lib/data/authors";

export const metadata = { title: "Nos auteurs — Morphose Éditions" };
export const dynamic = "force-dynamic";

export default async function AuthorsPage() {
  const authors = await getPublishedAuthors();

  return (
    <div className="bg-paper text-ink">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <p className="font-marker text-2xl text-red">Le collectif</p>
        <h1 className="mt-2 font-display text-5xl tracking-wide">NOS AUTEURS</h1>
        <p className="mt-4 max-w-2xl text-ink/60">
          Illustrateur·rice·s, poètes, auteur·rice·s : découvrez les artistes
          qui donnent vie à Morphose Éditions.
        </p>

        {authors.length === 0 ? (
          <p className="mt-16 text-ink/50">
            La liste des auteurs est en cours de préparation.
          </p>
        ) : (
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {authors.map((author) => (
              <Link
                key={author.id}
                href={`/auteurs/${author.slug}`}
                className="group flex flex-col overflow-hidden rounded-lg border-2 border-ink/10 bg-white transition hover:-translate-y-1 hover:border-red"
              >
                <div className="relative aspect-square overflow-hidden bg-ink/5">
                  <Image
                    src={author.photoUrl}
                    alt={author.name}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-1 p-5">
                  <h2 className="font-display text-2xl tracking-wide text-ink">
                    {author.name}
                  </h2>
                  {author.role && (
                    <span className="text-sm text-ink/60">{author.role}</span>
                  )}
                  <span className="mt-auto pt-2 font-display text-xs tracking-widest text-red">
                    VOIR LE PROFIL →
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
