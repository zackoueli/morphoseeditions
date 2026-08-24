"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminAuth } from "@/components/admin/admin-auth-context";

const LINKS = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/revues", label: "Revues" },
  { href: "/admin/actu", label: "Actualités" },
  { href: "/admin/a-propos", label: "À propos" },
  { href: "/admin/libraires", label: "Libraires" },
  { href: "/admin/commandes", label: "Commandes" },
];

export function AdminNav() {
  const pathname = usePathname();
  const { logout } = useAdminAuth();

  return (
    <nav className="flex w-48 shrink-0 flex-col gap-1">
      {LINKS.map((link) => {
        const active =
          link.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-md px-3 py-2 text-sm ${
              active ? "bg-ink text-paper" : "text-ink/70 hover:bg-ink/5"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={() => logout()}
        className="mt-4 rounded-md px-3 py-2 text-left text-sm text-red hover:bg-red/10"
      >
        Se déconnecter
      </button>
    </nav>
  );
}
