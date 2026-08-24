import {
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { storage } from "@/lib/firebase/client";

export async function uploadFile(path: string, blob: Blob): Promise<string> {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, blob);
  return getDownloadURL(storageRef);
}

export async function uploadIssueAssets(
  issueId: string,
  coverFile: File,
  pdfFile: File,
  pageBlobs: Blob[],
  onProgress?: (label: string) => void
): Promise<{ coverImageUrl: string; pdfUrl: string; pageImageUrls: string[] }> {
  onProgress?.("Envoi de la couverture...");
  const coverImageUrl = await uploadFile(
    `issues/${issueId}/cover.jpg`,
    coverFile
  );

  onProgress?.("Envoi du PDF...");
  const pdfUrl = await uploadFile(`issues/${issueId}/source.pdf`, pdfFile);

  const pageImageUrls: string[] = [];
  for (let i = 0; i < pageBlobs.length; i++) {
    onProgress?.(`Envoi de la page ${i + 1}/${pageBlobs.length}...`);
    const url = await uploadFile(
      `issues/${issueId}/pages/${String(i + 1).padStart(3, "0")}.jpg`,
      pageBlobs[i]
    );
    pageImageUrls.push(url);
  }

  return { coverImageUrl, pdfUrl, pageImageUrls };
}
