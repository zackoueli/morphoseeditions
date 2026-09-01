const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

const TO_EMAIL = process.env.CONTACT_TO_EMAIL ?? "morphoseeditions@gmail.com";

// Palette Morphose (cf. tailwind.config / globals.css)
const COLORS = {
  ink: "#0d0906",
  paper: "#f4ece0",
  saffron: "#e8a33d",
  red: "#c81e1e",
};

type MailField = { label: string; value: string };

type SendMailInput = {
  /** Objet de l'e-mail. */
  subject: string;
  /** Titre affiché en haut du corps (bandeau). */
  heading: string;
  /** Phrase d'introduction sous le titre. */
  intro: string;
  /** Champs du formulaire, affichés en liste label / valeur. */
  fields: MailField[];
  /** Bloc de texte libre affiché après les champs (ex. message de contact). */
  body?: { label: string; value: string };
  /** Adresse de réponse (la personne qui a rempli le formulaire). */
  replyTo?: { email: string; name?: string };
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const SERIF = "Georgia,'Times New Roman',serif";
const MONO = "'Courier New',monospace";

function fieldRow({ label, value }: MailField) {
  return `<tr>
      <td style="padding:0 0 18px;">
        <p style="margin:0 0 6px;font-family:${MONO};font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${COLORS.red};">${escapeHtml(label)}</p>
        <div style="padding:12px 16px;background:#ffffff;border:1px solid rgba(13,9,6,0.15);border-radius:6px;font-family:${SERIF};font-size:15px;color:${COLORS.ink};">${escapeHtml(value) || "—"}</div>
      </td>
    </tr>`;
}

function renderTemplate({
  heading,
  intro,
  fields,
  body,
}: Pick<SendMailInput, "heading" | "intro" | "fields" | "body">) {
  const bodyBlock = body
    ? `<p style="margin:0 0 6px;font-family:${MONO};font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${COLORS.red};">${escapeHtml(body.label)}</p>
       <div style="padding:14px 16px;background:#ffffff;border:1px solid rgba(13,9,6,0.15);border-radius:6px;font-family:${SERIF};font-size:15px;line-height:1.6;color:${COLORS.ink};white-space:pre-wrap;">${escapeHtml(body.value)}</div>`
    : "";

  return `<!doctype html>
<html lang="fr">
<body style="margin:0;padding:0;background:${COLORS.paper};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.paper};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <!-- En-tête -->
          <tr>
            <td style="padding:0 8px 24px;border-bottom:2px solid ${COLORS.ink};">
              <p style="margin:0 0 4px;font-family:${MONO};font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:${COLORS.red};">Morphose Éditions</p>
              <h1 style="margin:0;font-family:${SERIF};font-weight:bold;font-size:28px;line-height:1.1;letter-spacing:0.02em;text-transform:uppercase;color:${COLORS.ink};">${escapeHtml(heading)}</h1>
            </td>
          </tr>
          <!-- Corps -->
          <tr>
            <td style="padding:28px 8px 0;">
              <p style="margin:0 0 26px;font-family:${SERIF};font-size:15px;line-height:1.6;color:rgba(13,9,6,0.65);">${escapeHtml(intro)}</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${fields.map(fieldRow).join("\n")}
              </table>
              ${bodyBlock}
            </td>
          </tr>
          <!-- Pied -->
          <tr>
            <td style="padding:28px 8px 0;">
              <div style="border-top:1px solid rgba(13,9,6,0.15);padding-top:16px;">
                <p style="margin:0;font-family:${MONO};font-size:11px;letter-spacing:0.12em;color:rgba(13,9,6,0.4);">Message automatique — site morphoseeditions.fr</p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function renderText({
  heading,
  intro,
  fields,
  body,
}: Pick<SendMailInput, "heading" | "intro" | "fields" | "body">) {
  const lines = [heading, "", intro, ""];
  for (const f of fields) lines.push(`${f.label} : ${f.value || "—"}`);
  if (body) {
    lines.push("", `${body.label} :`, body.value);
  }
  lines.push("", "— Message automatique, site Morphose Éditions");
  return lines.join("\n");
}

/**
 * Envoie un e-mail transactionnel via l'API HTTP Brevo, mis en forme avec le
 * template Morphose (bandeau saffron, corps paper, pied ink).
 * Nécessite BREVO_API_KEY et BREVO_SENDER_EMAIL (expéditeur validé côté Brevo).
 * Ne jette jamais : loggue et renvoie false en cas d'échec pour ne pas
 * casser la soumission du formulaire (les données restent en Firestore).
 */
export async function sendMail({
  subject,
  heading,
  intro,
  fields,
  body,
  replyTo,
}: SendMailInput): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;

  if (!apiKey || !senderEmail) {
    console.warn(
      "sendMail: BREVO_API_KEY ou BREVO_SENDER_EMAIL manquant — e-mail non envoyé."
    );
    return false;
  }

  try {
    const res = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: {
          email: senderEmail,
          name: process.env.BREVO_SENDER_NAME ?? "Site Morphose Éditions",
        },
        to: [{ email: TO_EMAIL }],
        replyTo: replyTo?.email
          ? { email: replyTo.email, name: replyTo.name }
          : undefined,
        subject,
        textContent: renderText({ heading, intro, fields, body }),
        htmlContent: renderTemplate({ heading, intro, fields, body }),
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("sendMail: Brevo a répondu", res.status, detail);
      return false;
    }
    return true;
  } catch (err) {
    console.error("sendMail: échec de l'appel Brevo", err);
    return false;
  }
}
