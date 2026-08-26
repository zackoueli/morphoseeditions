import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="font-display text-3xl tracking-wide">TABLEAU DE BORD</h1>
      <p className="mt-2 text-ink/60">
        Gérez le catalogue, les actualités, la page à propos et suivez les
        commandes depuis ce back-office.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/revues"
          className="rounded-lg border-2 border-ink/10 p-6 hover:border-red"
        >
          <h2 className="font-display text-xl">Revues</h2>
          <p className="mt-1 text-sm text-ink/60">
            Ajouter, modifier, publier une revue et son PDF.
          </p>
        </Link>
        <Link
          href="/admin/actu"
          className="rounded-lg border-2 border-ink/10 p-6 hover:border-red"
        >
          <h2 className="font-display text-xl">Actualités</h2>
          <p className="mt-1 text-sm text-ink/60">
            Publier un article sur la vie de l&apos;association.
          </p>
        </Link>
        <Link
          href="/admin/auteurs"
          className="rounded-lg border-2 border-ink/10 p-6 hover:border-red"
        >
          <h2 className="font-display text-xl">Auteurs</h2>
          <p className="mt-1 text-sm text-ink/60">
            Ajouter les auteurs·rices du collectif et leur fiche.
          </p>
        </Link>
        <Link
          href="/admin/a-propos"
          className="rounded-lg border-2 border-ink/10 p-6 hover:border-red"
        >
          <h2 className="font-display text-xl">À propos</h2>
          <p className="mt-1 text-sm text-ink/60">
            Modifier le texte de présentation de l&apos;association.
          </p>
        </Link>
        <Link
          href="/admin/commandes"
          className="rounded-lg border-2 border-ink/10 p-6 hover:border-red"
        >
          <h2 className="font-display text-xl">Commandes</h2>
          <p className="mt-1 text-sm text-ink/60">
            Suivre les commandes payées et leur expédition.
          </p>
        </Link>
      </div>
    </div>
  );
}
