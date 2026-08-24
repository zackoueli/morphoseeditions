import { getAboutPage } from "@/lib/data/news";

export const metadata = { title: "À propos — Morphose Éditions" };
export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const about = await getAboutPage();

  return (
    <div className="bg-paper text-ink">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <p className="font-marker text-2xl text-red">Qui sommes-nous</p>
        <h1 className="mt-2 font-display text-5xl tracking-wide">À PROPOS</h1>

        <div className="prose prose-neutral mt-8 max-w-none whitespace-pre-wrap">
          {about?.content ??
            `Morphose Éditions est une association loi 1901 qui publie chaque année une revue collective de bandes dessinées et de poésie.

Cette page est gérée depuis le back-office de l'association — son contenu sera mis à jour prochainement.`}
        </div>
      </div>
    </div>
  );
}
