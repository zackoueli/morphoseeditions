import { getPublishedAuthors } from "@/lib/data/authors";
import { AuthorGallery } from "@/components/auteurs/author-gallery";

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
          <AuthorGallery authors={authors} />
        )}
      </div>
    </div>
  );
}
