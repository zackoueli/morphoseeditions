import fs from "node:fs/promises";
import path from "node:path";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata = { title: "Mentions légales — Morphose Éditions" };

export default async function MentionsLegalesPage() {
  const markdown = await fs.readFile(
    path.join(process.cwd(), "src/content/legal/mentions-legales.md"),
    "utf-8"
  );
  return <LegalPage markdown={markdown} />;
}
