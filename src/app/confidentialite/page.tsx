import fs from "node:fs/promises";
import path from "node:path";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata = { title: "Politique de confidentialité — Morphose Éditions" };

export default async function ConfidentialitePage() {
  const markdown = await fs.readFile(
    path.join(process.cwd(), "src/content/legal/politique-de-confidentialite.md"),
    "utf-8"
  );
  return <LegalPage markdown={markdown} />;
}
