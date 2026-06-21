import nodemailer from "nodemailer";
import { ApiError } from "../utils/ApiError.js";
import { verificationEmailTemplate } from "../utils/emailTemplates.js";

// Default sender. Brevo requires this to be a verified sender/domain in your
// Brevo account. Set EMAIL_FROM accordingly, e.g. "MockMate <no-reply@yourdomain.com>".
const FROM = process.env.EMAIL_FROM || "MockMate <no-reply@mockmate.app>";

// ── Reusable pooled transporter (one instance for the whole process) ─────────
let transporter = null;

const isConfigured = () =>
  Boolean(
    process.env.BREVO_SMTP_HOST &&
      process.env.BREVO_SMTP_USER &&
      process.env.BREVO_SMTP_PASS
  );

const createTransporter = () => {
  if (!isConfigured()) {
    throw new ApiError(
      500,
      "Email service is not configured (BREVO_SMTP_* env vars missing)"
    );
  }

  const port = Number(process.env.BREVO_SMTP_PORT) || 587;

  return nodemailer.createTransport({
    host: process.env.BREVO_SMTP_HOST, // smtp-relay.brevo.com
    port,
    secure: port === 465, // 465 = implicit TLS, 587 = STARTTLS
    auth: {
      user: process.env.BREVO_SMTP_USER,
      pass: process.env.BREVO_SMTP_PASS,
    },
    // Connection pooling — reuse sockets instead of dialing per email.
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
  });
};

// Lazily build and reuse the same transporter instance.
const getTransporter = () => {
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
};

// Verify the SMTP connection once at startup. Never throws — a bad/missing
// config only logs, so the Express server still boots and users can resend later.
const verifyTransporter = async () => {
  try {
    await getTransporter().verify();
    console.log("[email] Brevo SMTP transporter ready");
  } catch (err) {
    console.error("[email] SMTP verification failed:", err.message);
  }
};

// Run verification on module load (i.e. at server startup) only if configured.
if (isConfigured()) {
  verifyTransporter();
} else {
  console.warn(
    "[email] BREVO_SMTP_* not set — email sending is disabled until configured"
  );
}

// ── Transient-failure retry ──────────────────────────────────────────────────
// 4xx SMTP responses and connection errors are temporary; 5xx are permanent.
const isTransient = (err) => {
  const code = err?.responseCode;
  if (typeof code === "number" && code >= 400 && code < 500) return true;
  const transientCodes = [
    "ECONNECTION",
    "ETIMEDOUT",
    "ESOCKET",
    "ECONNRESET",
    "EAI_AGAIN",
    "EDNS",
  ];
  return transientCodes.includes(err?.code);
};

const sendWithRetry = async (mailOptions, retries = 2) => {
  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      return await getTransporter().sendMail(mailOptions);
    } catch (err) {
      attempt += 1;
      if (attempt > retries || !isTransient(err)) {
        throw err;
      }
      const delay = 500 * attempt; // simple linear backoff
      console.warn(
        `[email] transient SMTP failure (attempt ${attempt}/${retries}), retrying in ${delay}ms: ${err.message}`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

// ── Public API (signatures unchanged — controllers need no edits) ────────────

/**
 * Generic, reusable email sender — the single integration point with SMTP.
 * Reused by future features (password reset, reminders, feedback summaries).
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  if (!to || !subject || (!html && !text)) {
    throw new ApiError(500, "sendEmail requires 'to', 'subject', and 'html' or 'text'");
  }

  try {
    const info = await sendWithRetry({ from: FROM, to, subject, html, text });
    console.log(`[email] sent "${subject}" to ${to} (messageId: ${info.messageId})`);
    return info;
  } catch (err) {
    console.error(`[email] failed to send "${subject}" to ${to}:`, err.message);
    // Preserve existing behavior: caller (controller) decides what to do.
    throw new ApiError(502, "Failed to send email");
  }
};

/**
 * Sends the account verification email.
 * Accepts both { to } and { email }, and both { verifyUrl } and { verificationUrl }
 * so existing controller calls keep working unchanged.
 */
export const sendVerificationEmail = async ({
  to,
  email,
  username,
  verifyUrl,
  verificationUrl,
}) => {
  const recipient = to || email;
  const url = verifyUrl || verificationUrl;

  const { subject, html, text } = verificationEmailTemplate({
    username,
    verifyUrl: url,
  });

  return sendEmail({ to: recipient, subject, html, text });
};
