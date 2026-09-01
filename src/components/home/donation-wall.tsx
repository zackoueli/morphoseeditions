import Image from "next/image";
import { getDonationMessages } from "@/lib/data/donation-messages";
import { DonateBar } from "@/components/donate/donate-bar";

export async function DonationWall() {
  const messages = await getDonationMessages();

  return (
    <section className="bg-paper text-ink">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <h2 className="font-display text-5xl tracking-wide sm:text-6xl">
          MERCI À VOUS
        </h2>
        <p className="mt-4 max-w-2xl text-ink/60">
          Faites un don à Morphose et laissez, si vous le souhaitez, un mot, une
          photo ou un petit dessin : il s&apos;affichera ici, sur la page
          d&apos;accueil.
        </p>

        <div className="mt-8">
          <DonateBar />
        </div>

        {messages.length > 0 && (
          <>
            <h3 className="mt-16 font-display text-5xl tracking-wide sm:text-6xl">
              CONTRIBUTEURS
            </h3>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {messages.map((m) => (
              <figure
                key={m.id}
                className="flex flex-col gap-5 border-2 border-ink bg-paper p-6"
              >
                {m.imageUrl && (
                  <div className="relative aspect-[3/2] w-full">
                    <Image
                      src={m.imageUrl}
                      alt={
                        m.kind === "drawing"
                          ? "Dessin d'un donateur"
                          : "Photo d'un donateur"
                      }
                      fill
                      sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                      className="object-contain"
                      unoptimized={m.kind === "drawing"}
                    />
                  </div>
                )}
                {(m.message || m.authorName) && (
                  <figcaption className="flex flex-col gap-3">
                    {m.message && (
                      <p className="whitespace-pre-wrap font-display text-2xl leading-tight tracking-wide text-ink">
                        {m.message}
                      </p>
                    )}
                    {m.authorName && (
                      <span className="font-mono text-xs uppercase tracking-[0.14em] text-red">
                        — {m.authorName}
                      </span>
                    )}
                  </figcaption>
                )}
              </figure>
            ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
