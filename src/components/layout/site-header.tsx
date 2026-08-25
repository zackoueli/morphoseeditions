"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart/cart-context";
import { SearchBar } from "@/components/layout/search-bar";
import { pickRandomHeaderTheme, type HeaderTheme } from "@/components/layout/header-themes";

const NAV_LINKS = [
  { href: "/catalogue", label: "Catalogue" },
  { href: "/lecture", label: "Lecture" },
  { href: "/a-propos", label: "L'Association" },
  { href: "/libraires", label: "Libraires" },
];

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
            <>
              <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-red">
                <Image
                  src="/logo.jpeg"
                  alt="Morphose Éditions"
                  fill
                  sizes="44px"
                  className="object-cover"
                  priority
                />
              </span>
              <span className="font-display text-2xl tracking-wide text-paper">
                MORPHOSE
              </span>
            </>
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

        <div className="flex items-center gap-4">
          <Link
            href="/panier"
            className="relative flex items-center gap-2 rounded-full bg-red px-4 py-2 font-display text-sm tracking-wide text-paper transition hover:bg-red-dark"
          >
            PANIER
            {totalItems > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-saffron font-mono text-xs text-ink">
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
        </nav>
      )}
    </header>
  );
}
