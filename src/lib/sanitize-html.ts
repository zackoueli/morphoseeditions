/**
 * Nettoyage HTML sans dépendance (pas de jsdom : incompatible avec le runtime
 * serverless de Vercel).
 *
 * Le HTML traité provient uniquement de l'éditeur riche du back-office, derrière
 * authentification admin — il n'y a pas d'entrée publique. On applique malgré
 * tout une allow-list stricte : seules les balises/attributs listés survivent,
 * tout le reste (script, on*, style arbitraire, href javascript:…) est retiré.
 */

const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
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
  "span",
  "img",
  "figure",
  "figcaption",
]);

const VOID_TAGS = new Set(["br", "hr", "img"]);

// Attributs autorisés par balise.
const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "target", "rel"]),
  img: new Set(["src", "alt", "width", "height"]),
  "*": new Set(["style"]),
};

const SAFE_URL = /^(?:https?:|mailto:|tel:|\/|#|data:image\/(?:png|jpe?g|gif|webp|svg\+xml);base64,)/i;

// Propriétés CSS autorisées dans un attribut `style`, avec leurs valeurs permises.
const STYLE_RULES: { prop: string; value: RegExp }[] = [
  { prop: "text-align", value: /^(left|right|center|justify)$/i },
  {
    prop: "font-size",
    value: /^(?:0?\.\d+|[1-9]\d?(?:\.\d+)?)(?:rem|em|px|%)$/i,
  },
  { prop: "font-weight", value: /^(bold|normal|[1-9]00)$/i },
  { prop: "font-style", value: /^(italic|normal)$/i },
  { prop: "text-decoration", value: /^(underline|line-through|none)$/i },
  { prop: "float", value: /^(left|right|none)$/i },
  { prop: "width", value: /^(?:[1-9]\d?(?:\.\d+)?%|\d{1,4}px|auto)$/i },
  { prop: "max-width", value: /^(?:100%|\d{1,4}px)$/i },
  { prop: "margin", value: /^[\d.\srempx%auto]{1,40}$/i },
];

function sanitizeStyle(raw: string): string {
  const out: string[] = [];
  for (const decl of raw.split(";")) {
    const idx = decl.indexOf(":");
    if (idx === -1) continue;
    const prop = decl.slice(0, idx).trim().toLowerCase();
    const value = decl.slice(idx + 1).trim();
    if (/url\s*\(|expression|[<>]/i.test(value)) continue;
    const rule = STYLE_RULES.find((r) => r.prop === prop);
    if (rule && rule.value.test(value)) {
      out.push(`${prop}: ${value}`);
    }
  }
  return out.join("; ");
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function sanitizeAttrs(tag: string, attrString: string): string {
  const allowed = new Set([
    ...(ALLOWED_ATTRS[tag] ?? []),
    ...(ALLOWED_ATTRS["*"] ?? []),
  ]);
  const out: string[] = [];

  const attrRe = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let m: RegExpExecArray | null;
  while ((m = attrRe.exec(attrString))) {
    const name = m[1].toLowerCase();
    const value = m[2] ?? m[3] ?? m[4] ?? "";
    if (name.startsWith("on")) continue;
    if (!allowed.has(name)) continue;

    if (name === "href" || name === "src") {
      if (!SAFE_URL.test(value.trim())) continue;
    }
    if (name === "style") {
      const clean = sanitizeStyle(value);
      if (!clean) continue;
      out.push(`style="${escapeAttr(clean)}"`);
      continue;
    }
    if (name === "target") {
      out.push(`target="_blank"`);
      continue;
    }
    if ((name === "width" || name === "height") && !/^\d{1,4}$/.test(value.trim())) {
      continue;
    }
    out.push(value === "" ? name : `${name}="${escapeAttr(value)}"`);
  }

  if (tag === "a" && /href=/.test(out.join(" ")) && /target="_blank"/.test(out.join(" "))) {
    out.push(`rel="noopener noreferrer"`);
  }

  return out.length ? " " + out.join(" ") : "";
}

export function sanitizeRichText(html: string): string {
  if (!html) return "";

  // Retire d'emblée les blocs dangereux (contenu inclus).
  let cleaned = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\s*(script|style|iframe|object|embed|noscript|template)[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|style|iframe|object|embed|noscript|template)\b[^>]*\/?\s*>/gi, "");

  cleaned = cleaned.replace(
    /<\s*(\/?)\s*([a-zA-Z][a-zA-Z0-9]*)((?:[^<>"']|"[^"]*"|'[^']*')*)\s*(\/?)\s*>/g,
    (_full, slash: string, rawTag: string, attrs: string, selfClose: string) => {
      const tag = rawTag.toLowerCase();
      if (!ALLOWED_TAGS.has(tag)) return "";
      if (slash === "/") return `</${tag}>`;
      const cleanAttrs = sanitizeAttrs(tag, attrs);
      if (VOID_TAGS.has(tag)) return `<${tag}${cleanAttrs} />`;
      return `<${tag}${cleanAttrs}>${selfClose ? `</${tag}>` : ""}`;
    }
  );

  // Supprime toute balise résiduelle (< ... >) non reconnue par le passage ci-dessus.
  cleaned = cleaned.replace(/<(?!\/?(?:[a-zA-Z]))[^>]*>/g, "");

  return cleaned;
}
