import Link from "next/link";
import { DonationMessageForm } from "@/components/donate/donation-message-form";

export const metadata = { title: "Merci — Morphose Éditions" };

export default async function DonateThanksPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  return (
    <div className="bg-paper text-ink">
      <div className="mx-auto max-w-xl px-4 py-24 sm:px-6">
        <div className="text-center">
          <h1 className="font-display text-4xl tracking-wide text-teal">
            MERCI POUR VOTRE SOUTIEN
          </h1>
          <p className="mt-4 text-ink/60">
            Votre don aide directement à financer l&apos;impression des
            prochains numéros et la vie de l&apos;association.
          </p>
        </div>

        {session_id && (
          <div className="mt-12">
            <DonationMessageForm sessionId={session_id} />
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-block font-display text-sm tracking-widest text-red hover:underline"
          >
            RETOUR À L&apos;ACCUEIL →
          </Link>
        </div>
      </div>
    </div>
  );
}
