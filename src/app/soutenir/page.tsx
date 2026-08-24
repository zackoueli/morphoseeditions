import { DonateForm } from "@/components/donate/donate-form";

export const metadata = { title: "Soutenir — Morphose Éditions" };

export default function SoutenirPage() {
  return (
    <div className="bg-paper text-ink">
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <p className="font-marker text-2xl text-red">Coup de pouce</p>
        <h1 className="mt-2 font-display text-5xl tracking-wide">
          SOUTENIR L&apos;ASSOCIATION
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-ink/60">
          Nos revues restent gratuites en ligne grâce au soutien de nos
          lecteur·rice·s. Chaque don, même petit, aide à financer
          l&apos;impression et les prochains numéros.
        </p>
        <div className="mt-10">
          <DonateForm />
        </div>
      </div>
    </div>
  );
}
