"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart/cart-context";
import { SearchBar } from "@/components/layout/search-bar";
import { pickRandomHeaderTheme, type HeaderTheme } from "@/components/layout/header-themes";

const NAV_LINKS = [
  { href: "/actu", label: "Actu" },
  { href: "/#nos-auteurs", label: "Nos auteurs" },
  { href: "/catalogue", label: "Catalogue" },
  { href: "/lecture", label: "Lecture" },
  { href: "/a-propos", label: "L'Association" },
  { href: "/libraires", label: "Libraires" },
];

/** Caddie griffonné à la main, trait volontairement tremblé. */
function ScribbleCartIcon() {
  return (
    <svg
      viewBox="0 0 32 32"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {/* poignée + montant */}
      <path d="M2.5 4.2c1.4-.4 2.7-.1 3.3 1 .5 1 .8 2.4 1.1 4.1" />
      {/* corbeille, contour brouillon non fermé */}
      <path d="M6.6 9.1c4.6-.7 9.6-1 15.1-.7 2.3.1 4.6.3 6.9.7-.7 2.6-1.5 5-2.6 7.6-.3.7-1 1.2-1.8 1.2-4.7.2-9 .3-13.1.1-.9 0-1.6-.6-1.8-1.4-.9-2.4-1.7-4.8-2.4-7.3" />
      {/* barreaux verticaux tremblés */}
      <path d="M12 9.4c.2 2.8.1 5.6-.2 8.3" />
      <path d="M17.4 9.2c.1 2.9.1 5.8-.1 8.7" />
      <path d="M22.6 9.4c-.3 2.7-.7 5.3-1.3 8" />
      {/* barre horizontale */}
      <path d="M7.6 13.2c5.7-.5 11.6-.6 17.7-.3" />
      {/* roues */}
      <path d="M12 24.2c.1.9-.6 1.7-1.5 1.7s-1.6-.7-1.6-1.6.6-1.7 1.5-1.7 1.5.7 1.6 1.6Z" />
      <path d="M23.4 24.1c.1.9-.5 1.7-1.4 1.8-.9 0-1.6-.7-1.7-1.5 0-.9.6-1.7 1.5-1.8.9 0 1.5.6 1.6 1.5Z" />
    </svg>
  );
}

export function SiteHeader() {
  const { totalItems } = useCart();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<HeaderTheme | null>(null);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const transparent = isHome && !scrolled && !open;

  useEffect(() => {
    setTheme(pickRandomHeaderTheme());
  }, []);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b-2 bg-cover bg-repeat-x bg-left-top transition-colors duration-300 ${
        transparent
          ? "border-transparent bg-transparent"
          : "border-paper/10 bg-ink/95 backdrop-blur"
      }`}
      style={
        theme && !transparent
          ? { backgroundImage: `linear-gradient(rgba(13,9,6,0.7), rgba(13,9,6,0.7)), url(${theme.bgSrc})` }
          : undefined
      }
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          {theme ? (
            <span className="relative h-10 w-auto shrink-0">
              <Image
                src={theme.logoSrc}
                alt={theme.logoAlt}
                width={220}
                height={56}
                className="h-10 w-auto object-contain"
                priority
              />
            </span>
          ) : (
            <span className="h-10 w-[176px] shrink-0" aria-hidden />
          )}
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-display text-sm tracking-widest text-paper/80 transition hover:text-saffron"
            >
              {link.label.toUpperCase()}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block md:w-48 lg:w-56">
          <SearchBar />
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/soutenir"
            className="hidden items-center gap-2 rounded-full bg-saffron px-4 py-2 font-display text-sm tracking-wide text-ink transition hover:bg-saffron/80 sm:flex"
          >
            SOUTENIR
          </Link>
          <Link
            href="/panier"
            aria-label="Panier"
            className="relative flex h-11 w-11 items-center justify-center rounded-full bg-red text-paper transition hover:bg-red-dark"
          >
            <ScribbleCartIcon />
            {totalItems > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-saffron font-mono text-xs text-ink">
                {totalItems}
              </span>
            )}
          </Link>
          <button
            type="button"
            className="flex flex-col gap-1.5 lg:hidden"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="h-0.5 w-6 bg-paper" />
            <span className="h-0.5 w-6 bg-paper" />
            <span className="h-0.5 w-6 bg-paper" />
          </button>
        </div>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-paper/10 px-4 pb-4 lg:hidden">
          <div className="py-3 md:hidden">
            <SearchBar />
          </div>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="py-3 font-display text-lg tracking-wide text-paper/90"
            >
              {link.label.toUpperCase()}
            </Link>
          ))}
          <Link
            href="/soutenir"
            onClick={() => setOpen(false)}
            className="py-3 font-display text-lg tracking-wide text-saffron"
          >
            SOUTENIR
          </Link>
        </nav>
      )}
    </header>
  );
}
