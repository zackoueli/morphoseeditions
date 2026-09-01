import Link from "next/link";
import Image from "next/image";

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden">
      <div className="paint-edge relative bg-saffron pb-16 pt-14">
        <div className="mx-auto flex max-w-xl justify-center gap-10">
          <Link
            href="https://www.instagram.com/morphoseeditions"
            target="_blank"
            rel="noreferrer noopener"
            className="flex flex-col items-center gap-2 text-ink transition hover:-translate-y-0.5 hover:text-paper"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-ink">
              <InstagramIcon />
            </span>
            <span className="font-display text-xs tracking-widest">INSTAGRAM</span>
          </Link>
          <Link
            href="/contact"
            className="flex flex-col items-center gap-2 text-ink transition hover:-translate-y-0.5 hover:text-paper"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-ink">
              <MailIcon />
            </span>
            <span className="font-display text-xs tracking-widest">CONTACT</span>
          </Link>
        </div>
      </div>

      <div className="paint-edge relative bg-ink pb-4" />

      <div className="relative bg-ink pb-8 pt-8 text-paper">
        <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-5 px-4 text-center sm:px-6">
          <Link href="/" className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full">
            <Image
              src="/logo.jpeg"
              alt="Morphose Éditions"
              fill
              sizes="56px"
              className="object-cover"
            />
          </Link>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-paper/40">
            <Link href="/mentions-legales" className="hover:text-paper/70">Mentions légales</Link>
            <Link href="/cgv" className="hover:text-paper/70">CGV</Link>
            <Link href="/confidentialite" className="hover:text-paper/70">Confidentialité</Link>
            <span className="text-paper/30">
              <Link href="/admin" className="hover:text-paper/50" aria-label="Espace administrateur">
                ©
              </Link>{" "}
              {new Date().getFullYear()} Morphose Éditions — Tous droits réservés
            </span>
          </div>

          <p className="text-xs text-paper/30">
            Site développé par{" "}
            <Link
              href="https://breizhapp.tech"
              target="_blank"
              rel="noreferrer noopener"
              className="text-paper/50 hover:text-saffron"
            >
              BreizhApp
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
