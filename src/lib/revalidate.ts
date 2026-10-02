import { revalidatePath } from "next/cache";

/**
 * Les pages publiques sont mises en cache (cf. `revalidate` dans chaque page).
 * À appeler après toute modification de contenu (back-office, stock) pour que
 * le changement soit visible tout de suite sur le site.
 */
export function revalidatePublicPages() {
  revalidatePath("/", "layout");
}
