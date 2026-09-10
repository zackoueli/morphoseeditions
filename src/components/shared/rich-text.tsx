import { sanitizeRichText } from "@/lib/sanitize-html";

type Props = {
  /** HTML produit par l'éditeur du back-office (ou texte brut hérité). */
  content: string;
  className?: string;
};

function looksLikeHtml(value: string) {
  return /<[a-z][\s\S]*>/i.test(value);
}

/**
 * Affiche le contenu éditorial des pages gérées en back-office.
 * - Contenu HTML : nettoyé (allow-list) puis rendu.
 * - Contenu texte brut hérité : sauts de ligne préservés.
 */
export function RichText({ content, className }: Props) {
  const base = "prose prose-neutral max-w-none";
  const wrapper = className ? `${base} ${className}` : base;

  if (!looksLikeHtml(content)) {
    return <div className={`${wrapper} whitespace-pre-wrap`}>{content}</div>;
  }

  return (
    <div
      className={wrapper}
      dangerouslySetInnerHTML={{ __html: sanitizeRichText(content) }}
    />
  );
}
