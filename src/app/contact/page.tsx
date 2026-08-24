import { ContactForm } from "@/components/contact/contact-form";

export const metadata = { title: "Contact — Morphose Éditions" };

export default function ContactPage() {
  return (
    <div className="bg-paper text-ink">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <p className="font-marker text-2xl text-red">Une question ?</p>
        <h1 className="mt-2 font-display text-5xl tracking-wide">CONTACT</h1>
        <p className="mt-4 text-ink/60">
          Pour toute question sur une commande, une revue ou l&apos;association,
          écrivez-nous.
        </p>
        <div className="mt-10">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
