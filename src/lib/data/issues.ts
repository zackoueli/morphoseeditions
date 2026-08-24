import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { Issue } from "@/lib/types";

const ISSUES_COLLECTION = "issues";

export async function getPublishedIssues(): Promise<Issue[]> {
  const q = query(collection(db, ISSUES_COLLECTION), where("published", "==", true));
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((d) => d.data() as Issue)
    .sort((a, b) => b.issueNumber - a.issueNumber);
}

export async function getIssueBySlug(slug: string): Promise<Issue | null> {
  const q = query(
    collection(db, ISSUES_COLLECTION),
    where("slug", "==", slug),
    where("published", "==", true)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as Issue;
}

export async function getIssueById(id: string): Promise<Issue | null> {
  const snap = await getDoc(doc(db, ISSUES_COLLECTION, id));
  if (!snap.exists()) return null;
  return snap.data() as Issue;
}
