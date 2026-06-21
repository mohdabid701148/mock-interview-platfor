import { ApiError } from "../utils/ApiError.js";
import { verificationEmailTemplate } from "../utils/emailTemplates.js";

// Brevo transactional email over HTTPS (port 443). Used instead of SMTP because
// PaaS hosts like Render block outbound SMTP ports (587/465).
const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

const isConfigured = () => Boolean(process.env.BREVO_API_KEY);

// Parse EMAIL_FROM ("MockMate <no-reply@x.com>" or "no-reply@x.com") into Brevo's
// sender shape. The sender email must be a VERIFIED sender in your Brevo account.
const parseSender = (raw) => {
  if (!raw) return { name: "MockMate", email: "no-reply@mockmate.app" };
  const m = raw.match(/^\s*(.*?)\s*<\s*([^>]+?)\s*>\s*$/);
  if (m) return { name: m[1] || "MockMate", email: m[2] };
  return { name: "MockMate", email: raw.trim() };
};

const SENDER = parseSender(process.env.EMAIL_FROM);

if (isConfigured()) {
  console.log(`[email] Brevo HTTP API ready (sender: ${SENDER.email})`);
} else {
  console.warn(
    "[email] BREVO_API_KEY not set — email sending is disabled until configured"
  );
}

// ── HTTP send with timeout + transient-failure retry ─────────────────────────
const postToBrevo = async ({ to, subject, html, text }) => {
  if (!isConfigured()) {
    throw new ApiError(500, "Email service is not configured (BREVO_API_KEY missing)");
  }

  const payload = {
    sender: SENDER,
    to: [{ email: to }],
    subject,
    htmlContent: html,
    textContent: text,
  };

  const maxRetries = 2;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000); // 15s timeout

    try {
      const res = await fetch(BREVO_API_URL, {
        method: "POST",
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (res.ok) {
        return await res.json().catch(() => ({}));
      }

      const bodyText = await res.text().catch(() => "");

      // 429 (rate limit) and 5xx are temporary — retry; 4xx is permanent.
      const transient = res.status === 429 || res.status >= 500;
      if (transient && attempt < maxRetries) {
        const delay = 500 * (attempt + 1);
        console.warn(`[email] Brevo API ${res.status}, retrying in ${delay}ms`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

      throw new Error(`Brevo API responded ${res.status}: ${bodyText}`);
    } catch (err) {
      clearTimeout(timer);

      // Aborted (timeout) or network-level errors are temporary.
      const networkLevel = err.name === "AbortError" || err.name === "TypeError";
      if (networkLevel && attempt < maxRetries) {
        const delay = 500 * (attempt + 1);
        console.warn(`[email] network error (${err.message}), retrying in ${delay}ms`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

      throw err;
    }
  }
};

// ── Public API (signatures unchanged — controllers need no edits) ────────────

/**
 * Generic, reusable email sender — the single integration point with Brevo.
 * Reused by future features (password reset, reminders, feedback summaries).
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  if (!to || !subject || (!html && !text)) {
    throw new ApiError(500, "sendEmail requires 'to', 'subject', and 'html' or 'text'");
  }

  try {
    const data = await postToBrevo({ to, subject, html, text });
    console.log(`[email] sent "${subject}" to ${to} (messageId: ${data?.messageId || "n/a"})`);
    return data;
  } catch (err) {
    console.error(`[email] failed to send "${subject}" to ${to}:`, err.message);
    // Preserve existing behavior: caller (controller) decides what to do.
    throw new ApiError(502, "Failed to send email");
  }
};

/**
 * Sends the account verification email containing a 6-digit code.
 * Accepts both { to } and { email } for the recipient.
 */
export const sendVerificationEmail = async ({ to, email, username, code }) => {
  const recipient = to || email;

  const { subject, html, text } = verificationEmailTemplate({ username, code });

  return sendEmail({ to: recipient, subject, html, text });
};
