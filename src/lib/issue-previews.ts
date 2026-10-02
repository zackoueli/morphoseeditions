import sharp from "sharp";

/** Nombre de pages intérieures mises en avant sur la fiche d'une revue. */
export const PREVIEW_PAGE_COUNT = 6;

/** En dessous de cette note, la page est du texte ou une page vide : on ne la montre pas. */
const ILLUSTRATED_THRESHOLD = 0.18;

/**
 * Note « visuelle » d'une page, calculée sur une miniature : contraste entre
 * grandes zones claires et sombres + présence de couleur. Une page de texte,
 * même dense, devient un gris uniforme une fois réduite et obtient une note
 * basse ; une planche, une illustration ou une photo obtient une note haute.
 */
async function visualScore(url: string): Promise<number> {
  try {
    const res = await fetch(url);
    if (!res.ok) return 0;
    const data = await sharp(Buffer.from(await res.arrayBuffer()))
      .resize(40, 50, { fit: "fill" })
      .removeAlpha()
      .raw()
      .toBuffer();

    const pixels = data.length / 3;
    let sum = 0;
    let sumSquares = 0;
    let saturation = 0;
    for (let i = 0; i < data.length; i += 3) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const luminance = (r + g + b) / 765;
      sum += luminance;
      sumSquares += luminance * luminance;
      saturation += (Math.max(r, g, b) - Math.min(r, g, b)) / 255;
    }
    const mean = sum / pixels;
    const contrast = Math.sqrt(Math.max(0, sumSquares / pixels - mean * mean));
    return contrast + 1.5 * (saturation / pixels);
  } catch {
    return 0;
  }
}

/**
 * Choisit automatiquement les pages intérieures à montrer sur la fiche : des
 * pages illustrées, réparties du début à la fin de la revue. Retourne des
 * numéros de page (1 = première image, la couverture).
 */
export async function pickPreviewPages(
  pageImageUrls: string[],
  count = PREVIEW_PAGE_COUNT
): Promise<number[]> {
  // On écarte les couvertures (première et dernière images).
  const inner = pageImageUrls.slice(1, -1);
  if (inner.length === 0) return [];

  const scores = await Promise.all(inner.map(visualScore));
  let candidates = inner
    .map((_, i) => i)
    .filter((i) => scores[i] >= ILLUSTRATED_THRESHOLD);
  if (candidates.length < count) {
    candidates = inner
      .map((_, i) => i)
      .sort((a, b) => scores[b] - scores[a])
      .slice(0, count)
      .sort((a, b) => a - b);
  }

  const picks = Math.min(count, candidates.length);
  return Array.from(
    { length: picks },
    (_, k) => candidates[Math.floor(((k + 0.5) * candidates.length) / picks)] + 2
  );
}

/**
 * Pages à enregistrer avec la revue : celles choisies dans le back-office si
 * elles existent dans le PDF, sinon un choix automatique.
 */
export async function resolvePreviewPages(
  requested: number[],
  pageImageUrls: string[]
): Promise<number[]> {
  const valid = [...new Set(requested)].filter((n) => n <= pageImageUrls.length);
  return valid.length > 0 ? valid : pickPreviewPages(pageImageUrls);
}
