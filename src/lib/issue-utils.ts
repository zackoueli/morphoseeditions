import type { Issue } from "@/lib/types";

/**
 * Le produit se lit-il dans la rubrique Lecture ? Il faut que la case soit
 * cochée dans le back-office et qu'un PDF ait été envoyé. Les produits créés
 * avant l'existence de la case sont lisibles dès qu'ils ont des pages.
 */
export function isReadableOnline(issue: Issue): boolean {
  const hasPages = (issue.pageImageUrls?.length ?? 0) > 0;
  return hasPages && (issue.readable ?? true);
}
