import nodemailer from "nodemailer";

/**
 * Outbound mail via Zoho SMTP.
 *
 * If ZOHO_SMTP_PASS is unset the message is logged to the server console and
 * the call REJECTS with a clear reason. It deliberately does not resolve
 * successfully: callers record the outcome in `email_sends`, and a silent
 * "sent" for a message that never left would be the same defect class as the
 * 2026-08-14 forms that faked success.
 */

const HOST = process.env.ZOHO_SMTP_HOST || "smtp.zoho.com";
const PORT = Number(process.env.ZOHO_SMTP_PORT || 587);
const USER = process.env.ZOHO_SMTP_USER || "info@faithfoundationsf.org";
const PASS = process.env.ZOHO_SMTP_PASS;

export const MAIL_CONFIGURED = Boolean(PASS);

export type SendArgs = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
};

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: HOST,
      port: PORT,
      // 587 is STARTTLS, not implicit TLS. `secure` must be false there or the
      // handshake hangs until timeout.
      secure: PORT === 465,
      auth: { user: USER, pass: PASS },
    });
  }
  return transporter;
}

export async function sendEmail({
  to,
  subject,
  html,
  replyTo,
}: SendArgs): Promise<void> {
  if (!MAIL_CONFIGURED) {
    console.log(
      `[email] NOT SENT (ZOHO_SMTP_PASS unset) → to=${to} subject="${subject}"`
    );
    throw new Error(
      "Email is not configured: ZOHO_SMTP_PASS is not set. The message was logged on the server but not delivered."
    );
  }

  await getTransporter().sendMail({
    from: `"FAITH Foundation" <${USER}>`,
    to,
    subject,
    html,
    replyTo: replyTo || USER,
  });
}
