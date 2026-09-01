import { getLibrairesPage } from "@/lib/data/news";

export const metadata = { title: "Libraires — Morphose Éditions" };
export const dynamic = "force-dynamic";

export default async function LibrairesPage() {
  const page = await getLibrairesPage();

  return (
    <div className="bg-paper text-ink">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="font-display text-5xl tracking-wide">LIBRAIRES</h1>

        <div className="prose prose-neutral mt-8 max-w-none whitespace-pre-wrap">
          {page?.content ??
            `Vous êtes libraire, disquaire ou revendeur et souhaitez proposer nos revues dans votre boutique ?

Nous proposons nos publications en dépôt-vente ou à la commande, avec des conditions adaptées aux petites structures indépendantes.

Cette page est gérée depuis le back-office de l'association — son contenu sera mis à jour prochainement. Contactez-nous en attendant via la page Contact.`}
        </div>
      </div>
    </div>
  );
}
