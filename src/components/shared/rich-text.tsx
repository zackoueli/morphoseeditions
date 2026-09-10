import DOMPurify from "isomorphic-dompurify";

type Props = {
  /** HTML produit par l'éditeur du back-office (ou texte brut hérité). */
  content: string;
  className?: string;
};

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "u",
  "s",
  "h2",
  "h3",
  "ul",
  "ol",
  "li",
  "blockquote",
  "a",
  "hr",
];

const ALLOWED_ATTR = ["href", "target", "rel", "style"];

// On restreint `style` à la seule propriété text-align (aucune injection CSS arbitraire).
const ALLOWED_STYLE = /^\s*text-align\s*:\s*(left|right|center|justify)\s*;?\s*$/i;

function looksLikeHtml(value: string) {
  return /<[a-z][\s\S]*>/i.test(value);
}

function sanitize(html: string) {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|tel:|\/|#)/i,
  });

  // Purge des `style` qui ne sont pas un simple text-align.
  return clean.replace(/ style="([^"]*)"/gi, (match, value) =>
    ALLOWED_STYLE.test(value) ? match : ""
  );
}

/**
 * Affiche le contenu éditorial des pages gérées en back-office.
 * - Contenu HTML : nettoyé puis rendu.
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
      dangerouslySetInnerHTML={{ __html: sanitize(content) }}
    />
  );
}
