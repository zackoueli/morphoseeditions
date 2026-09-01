import { DonateForm } from "@/components/donate/donate-form";

export const metadata = { title: "Soutenir — Morphose Éditions" };

export default function SoutenirPage() {
  return (
    <div className="bg-paper text-ink">
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <h1 className="font-display text-5xl tracking-wide">
          SOUTENIR L&apos;ASSOCIATION
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-ink/60">
          Morphose est une maison d&apos;édition associative qui vit en partie
          grâce à vos dons. Chaque soutien nous permet de garder des prix bas
          pour nos revues.
        </p>
        <div className="mt-10">
          <DonateForm />
        </div>
      </div>
    </div>
  );
}
