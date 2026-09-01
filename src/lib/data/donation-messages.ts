import { collection, getDocs, query } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { DonationMessage } from "@/lib/types";

const COLLECTION = "donationMessages";

/**
 * Mur public des contributions de donateurs, les plus récentes en premier.
 * Renvoie une liste vide si la collection est inaccessible (règles pas encore
 * déployées, réseau) afin de ne jamais casser le rendu de la page d'accueil.
 */
export async function getDonationMessages(): Promise<DonationMessage[]> {
  try {
    const snapshot = await getDocs(query(collection(db, COLLECTION)));
    return snapshot.docs
      .map((d) => d.data() as DonationMessage)
      .sort((a, b) => b.createdAt - a.createdAt);
  } catch (err) {
    console.error("getDonationMessages: lecture impossible", err);
    return [];
  }
}
