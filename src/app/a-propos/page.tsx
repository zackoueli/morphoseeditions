import { getAboutPage } from "@/lib/data/news";
import { MembershipForm } from "@/components/association/membership-form";

export const metadata = { title: "À propos — Morphose Éditions" };
export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const about = await getAboutPage();

  return (
    <div className="bg-paper text-ink">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="font-display text-5xl tracking-wide">À PROPOS</h1>

        <div className="prose prose-neutral mt-8 max-w-none whitespace-pre-wrap">
          {about?.content ??
            `Morphose Éditions est une association loi 1901 qui publie chaque année une revue collective de bandes dessinées et de poésie.

Cette page est gérée depuis le back-office de l'association — son contenu sera mis à jour prochainement.`}
        </div>

        <div className="mt-16 border-t-2 border-ink/10 pt-12">
          <h2 className="font-display text-3xl tracking-wide">
            ADHÉRER À L&apos;ASSOCIATION
          </h2>
          <p className="mt-3 text-ink/60">
            Rejoignez Morphose Éditions en remplissant le formulaire ci-dessous.
          </p>
          <div className="mt-8">
            <MembershipForm />
          </div>
        </div>
      </div>
    </div>
  );
}
