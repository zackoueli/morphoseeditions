import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAuthorBySlug } from "@/lib/data/authors";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);
  return { title: author ? `${author.name} — Morphose Éditions` : "Auteur — Morphose Éditions" };
}

export default async function AuthorDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);

  if (!author) notFound();

  return (
    <div className="bg-paper text-ink">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <Link
          href="/auteurs"
          className="font-display text-sm tracking-widest text-red hover:underline"
        >
          ← TOUS LES AUTEURS
        </Link>

        <div className="mt-8 grid gap-10 sm:grid-cols-[280px_1fr] sm:items-start">
          <div className="relative aspect-square overflow-hidden rounded-lg border-2 border-ink/10">
            <Image
              src={author.photoUrl}
              alt={author.name}
              fill
              sizes="280px"
              className="object-cover"
            />
          </div>

          <div>
            <h1 className="font-display text-5xl tracking-wide">{author.name}</h1>
            {author.role && (
              <p className="mt-2 font-marker text-2xl text-red">{author.role}</p>
            )}
            {author.bio && (
              <p className="mt-6 whitespace-pre-line text-ink/70">{author.bio}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
