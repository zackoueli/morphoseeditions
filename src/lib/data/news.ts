import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { NewsPost } from "@/lib/types";

const NEWS_COLLECTION = "news";

export async function getPublishedNews(): Promise<NewsPost[]> {
  const q = query(collection(db, NEWS_COLLECTION), where("published", "==", true));
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((d) => d.data() as NewsPost)
    .sort((a, b) => b.publishedAt - a.publishedAt);
}

export async function getNewsBySlug(slug: string): Promise<NewsPost | null> {
  const q = query(
    collection(db, NEWS_COLLECTION),
    where("slug", "==", slug),
    where("published", "==", true)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as NewsPost;
}

export async function getAboutPage() {
  return getSettingsPage("about");
}

export async function getLibrairesPage() {
  return getSettingsPage("libraires");
}

async function getSettingsPage(id: string) {
  const snap = await getDoc(doc(db, "settings", id));
  if (!snap.exists()) return null;
  return snap.data() as { content: string; updatedAt: number };
}
