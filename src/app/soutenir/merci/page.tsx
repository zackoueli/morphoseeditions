import Link from "next/link";

export default function DonateThanksPage() {
  return (
    <div className="bg-paper text-ink">
      <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-4xl tracking-wide text-teal">
          MERCI POUR VOTRE SOUTIEN
        </h1>
        <p className="mt-4 text-ink/60">
          Votre don aide directement à financer l&apos;impression des
          prochains numéros et la vie de l&apos;association.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block font-display text-sm tracking-widest text-red hover:underline"
        >
          RETOUR À L&apos;ACCUEIL →
        </Link>
      </div>
    </div>
  );
}
