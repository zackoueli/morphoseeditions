import {
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { storage } from "@/lib/firebase/client";

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.85;

async function compressImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const ratio = Math.min(MAX_DIMENSION / bitmap.width, MAX_DIMENSION / bitmap.height, 1);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * ratio);
  canvas.height = Math.round(bitmap.height * ratio);
  const context = canvas.getContext("2d");
  if (!context) return file;
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
  );
  return blob ?? file;
}

export async function uploadFile(path: string, blob: Blob): Promise<string> {
  const toUpload =
    blob instanceof File && blob.type.startsWith("image/")
      ? await compressImage(blob)
      : blob;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, toUpload);
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
