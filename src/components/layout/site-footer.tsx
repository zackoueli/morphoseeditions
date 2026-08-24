import Link from "next/link";
import Image from "next/image";

const NAV_LINKS = [
  { href: "/catalogue", label: "Catalogue" },
  { href: "/actu", label: "Actu" },
  { href: "/a-propos", label: "À propos" },
  { href: "/soutenir", label: "Soutenir" },
  { href: "/contact", label: "Contact" },
];

const SOCIAL_LINKS = [
  { href: "https://instagram.com", label: "Instagram" },
  { href: "https://facebook.com", label: "Facebook" },
];

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
      <path
        d="M14 9h2.5V6H14c-1.9 0-3.5 1.6-3.5 3.5V11H8.5v3H10.5v6h3v-6h2.3l.7-3H13.5v-1.3c0-.4.3-.7.5-.7Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden">
      <div className="torn-edge relative bg-saffron pb-6 pt-14 text-ink">
        <p className="text-center font-display text-4xl tracking-wide sm:text-5xl">
          SOUTENEZ-NOUS
        </p>
      </div>

      <div className="relative bg-saffron pb-16 pt-4">
        <div className="mx-auto flex max-w-xl justify-center gap-10">
          {SOCIAL_LINKS.map((social) => (
            <Link
              key={social.href}
              href={social.href}
              target="_blank"
              rel="noreferrer noopener"
              className="flex flex-col items-center gap-2 text-ink transition hover:-translate-y-0.5 hover:text-paper"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-ink">
                {social.label === "Instagram" ? <InstagramIcon /> : <FacebookIcon />}
              </span>
              <span className="font-display text-xs tracking-widest">
                {social.label.toUpperCase()}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className="torn-edge relative bg-ink pb-4" />

      <div className="relative bg-ink pb-16 pt-10 text-paper">
        <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-8 px-4 text-center sm:px-6">
          <Link href="/" className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-red">
            <Image
              src="/logo.jpeg"
              alt="Morphose Éditions"
              fill
              sizes="80px"
              className="object-cover"
            />
          </Link>

          <nav className="flex flex-wrap justify-center gap-x-8 gap-y-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-display text-sm tracking-widest text-paper/80 hover:text-saffron"
              >
                {link.label.toUpperCase()}
              </Link>
            ))}
          </nav>

          <div className="flex gap-6 text-paper/70">
            <Link href="https://instagram.com" target="_blank" rel="noreferrer noopener" className="hover:text-paper">
              <InstagramIcon />
            </Link>
            <Link href="https://facebook.com" target="_blank" rel="noreferrer noopener" className="hover:text-paper">
              <FacebookIcon />
            </Link>
          </div>

          <p className="max-w-sm text-sm text-paper/50">
            Association loi 1901. Revues annuelles de bandes dessinées et de
            poésie, en lecture libre, imprimées avec soin.
          </p>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-paper/40">
            <Link href="/mentions-legales" className="hover:text-paper/70">Mentions légales</Link>
            <Link href="/cgv" className="hover:text-paper/70">CGV</Link>
            <Link href="/confidentialite" className="hover:text-paper/70">Confidentialité</Link>
          </div>

          <p className="text-xs text-paper/30">
            © {new Date().getFullYear()} Morphose Éditions — Tous droits réservés
          </p>
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
