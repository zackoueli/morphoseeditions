import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { Author } from "@/lib/types";

const AUTHORS_COLLECTION = "authors";

export async function getPublishedAuthors(): Promise<Author[]> {
  const q = query(collection(db, AUTHORS_COLLECTION), where("published", "==", true));
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((d) => d.data() as Author)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getAuthorBySlug(slug: string): Promise<Author | null> {
  const q = query(
    collection(db, AUTHORS_COLLECTION),
    where("slug", "==", slug),
    where("published", "==", true)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as Author;
}

export async function getAuthorById(id: string): Promise<Author | null> {
  const snap = await getDoc(doc(db, AUTHORS_COLLECTION, id));
  if (!snap.exists()) return null;
  return snap.data() as Author;
}
