import { randomUUID } from "crypto";
import { adminDb, adminStorage } from "@/lib/firebase/admin";
import type { DonationMessage } from "@/lib/types";

export const MAX_MESSAGE = 280;
export const MAX_NAME = 80;
// ~2 Mo une fois décodé (la string base64 pèse ~1,37×).
export const MAX_IMAGE_BASE64 = 2_800_000;

function parseDataUrl(
  dataUrl: string
): { buffer: Buffer; contentType: string } | null {
  const match = /^data:(image\/(png|jpeg|webp));base64,(.+)$/.exec(dataUrl);
  if (!match) return null;
  return { contentType: match[1], buffer: Buffer.from(match[3], "base64") };
}

type CreateInput = {
  message: string;
  authorName: string;
  imageDataUrl?: string;
  kind?: "photo" | "drawing";
  stripeSessionId: string | null;
};

/**
 * Crée une contribution : upload éventuel de l'image dans Storage puis
 * écriture du document Firestore. Utilisé par l'API publique (après don) et
 * par l'API admin (ajout manuel).
 * Jette une Error("invalid_image") si la data URL est mal formée.
 */
export async function createDonationMessage({
  message,
  authorName,
  imageDataUrl,
  kind,
  stripeSessionId,
}: CreateInput): Promise<DonationMessage> {
  const db = adminDb();
  const ref = db.collection("donationMessages").doc();

  let imageUrl: string | null = null;
  if (imageDataUrl) {
    const decoded = parseDataUrl(imageDataUrl);
    if (!decoded) throw new Error("invalid_image");
    const ext = decoded.contentType.split("/")[1];
    const filePath = `donation-messages/${ref.id}/media.${ext}`;
    const token = randomUUID();
    const file = adminStorage().bucket().file(filePath);
    await file.save(decoded.buffer, {
      contentType: decoded.contentType,
      metadata: { metadata: { firebaseStorageDownloadTokens: token } },
    });
    imageUrl = `https://firebasestorage.googleapis.com/v0/b/${file.bucket.name}/o/${encodeURIComponent(
      filePath
    )}?alt=media&token=${token}`;
  }

  const doc: DonationMessage = {
    id: ref.id,
    message: message.trim(),
    authorName: authorName.trim(),
    imageUrl,
    kind: imageUrl ? kind ?? "photo" : null,
    stripeSessionId,
    createdAt: Date.now(),
  };
  await ref.set(doc);
  return doc;
}
