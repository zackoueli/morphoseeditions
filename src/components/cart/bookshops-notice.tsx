import Link from "next/link";

const BOOKSHOPS_BY_CITY: { city: string; shops: { name: string; address: string }[] }[] = [
  {
    city: "Angoulême",
    shops: [{ name: "L'Autre Librairie", address: "18 rue de Beaulieu, 16000 Angoulême" }],
  },
  {
    city: "Bordeaux",
    shops: [
      { name: "La Machine à Lire", address: "8 Pl. du Parlement, 33000 Bordeaux" },
      { name: "La Mauvaise Réputation", address: "19 Rue des Argentiers, 33000 Bordeaux" },
    ],
  },
  {
    city: "Lyon",
    shops: [
      { name: "Terre des Livres", address: "86 Rue de Marseille, 69007 Lyon" },
      { name: "Le Livre en Pente", address: "18 Rue des Pierres Plantées, 69001 Lyon" },
      { name: "La Gryffe", address: "5 Rue Sébastien Gryphe, 69007 Lyon" },
    ],
  },
  {
    city: "Nantes",
    shops: [
      { name: "Les Bien-Aimé.e.s", address: "2 Rue de la Paix, 44000 Nantes" },
      { name: "Durance", address: "4 All. d'Orléans, 44000 Nantes" },
    ],
  },
  {
    city: "Reims",
    shops: [
      { name: "Amory", address: "94 av. Jean Jaurès, 51100 Reims" },
      { name: "Au Coin des Mots", address: "128 av. Jean Jaurès, 51100 Reims" },
    ],
  },
];

export default function BookshopsNotice() {
  return (
    <details className="rounded-lg border-2 border-ink/10 p-5">
      <summary className="cursor-pointer font-display text-sm tracking-widest text-ink/70">
        NOS REVUES SONT AUSSI EN LIBRAIRIE — ÉVITEZ LES FRAIS DE PORT
      </summary>

      <p className="mt-4 text-sm text-ink/60">
        Vous êtes à Angoulême ? Vous pouvez aussi nous contacter pour récupérer
        votre commande en main propre, sans frais de port.{" "}
        <Link href="/contact" className="text-red hover:underline">
          Écrivez-nous
        </Link>
        .
      </p>

      <div className="mt-4 flex flex-col gap-4">
        {BOOKSHOPS_BY_CITY.map(({ city, shops }) => (
          <div key={city}>
            <p className="font-display text-xs tracking-widest text-ink/50">
              {city.toUpperCase()}
            </p>
            <ul className="mt-1 text-sm text-ink/70">
              {shops.map((shop) => (
                <li key={shop.name}>
                  {shop.name} — {shop.address}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-ink/40">Et d&apos;autres librairies partenaires à venir…</p>
    </details>
  );
}
