import { getPublishedIssues } from "@/lib/data/issues";
import { IssueCard } from "@/components/catalogue/issue-card";

export const metadata = {
  title: "Catalogue — Morphose Éditions",
};
export const dynamic = "force-dynamic";

export default async function CataloguePage() {
  const issues = await getPublishedIssues();

  return (
    <div className="bg-paper text-ink">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h1 className="font-display text-5xl tracking-wide">
          LE CATALOGUE
        </h1>
        <p className="mt-4 max-w-2xl text-ink/60">
          Chaque numéro se feuillette gratuitement en ligne. L&apos;exemplaire
          papier, imprimé en série limitée, se commande pour soutenir
          l&apos;association.
        </p>

        {issues.length === 0 ? (
          <p className="mt-16 text-ink/50">
            Le catalogue est en cours de préparation.
          </p>
        ) : (
          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            {issues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
