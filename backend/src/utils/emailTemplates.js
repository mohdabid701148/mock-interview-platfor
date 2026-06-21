// Reusable HTML email building blocks.
// `baseLayout` wraps any content in a consistent MockMate shell so future emails
// (password reset, interview reminders, feedback summaries) share one look.

const BRAND = {
  name: "MockMate",
  color: "#0f172a", // slate-900
  accent: "#4f46e5", // indigo-600
  muted: "#64748b", // slate-500
  bg: "#f1f5f9", // slate-100
};

export const baseLayout = ({ heading, bodyHtml, footerNote = "" }) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${BRAND.name}</title>
  </head>
  <body style="margin:0;padding:0;background:${BRAND.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.bg};padding:32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
            <!-- Header -->
            <tr>
              <td style="background:${BRAND.color};padding:24px 32px;">
                <span style="display:inline-block;width:36px;height:36px;line-height:36px;text-align:center;background:rgba(255,255,255,0.1);border-radius:10px;color:#fff;font-weight:700;font-size:18px;">M</span>
                <span style="color:#fff;font-size:20px;font-weight:700;vertical-align:middle;margin-left:10px;">${BRAND.name}</span>
              </td>
            </tr>
            <!-- Body -->
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 16px;font-size:22px;color:${BRAND.color};">${heading}</h1>
                ${bodyHtml}
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="padding:20px 32px;border-top:1px solid #e2e8f0;">
                <p style="margin:0;font-size:12px;color:${BRAND.muted};line-height:18px;">
                  ${footerNote || `You received this email because an action was requested on your ${BRAND.name} account. If this wasn't you, you can safely ignore it.`}
                </p>
              </td>
            </tr>
          </table>
          <p style="margin:16px 0 0;font-size:12px;color:${BRAND.muted};">© ${new Date().getFullYear()} ${BRAND.name}. Peer-to-peer mock interviews.</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

const button = (url, label) => `
  <a href="${url}" target="_blank"
     style="display:inline-block;background:${BRAND.accent};color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 28px;border-radius:12px;">
    ${label}
  </a>`;

export const verificationEmailTemplate = ({ username, verifyUrl }) => {
  const heading = "Verify your MockMate account";

  const bodyHtml = `
    <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:24px;">
      Hi ${username || "there"}, welcome to MockMate! 👋<br/>
      Please confirm your email address to activate your account.
    </p>
    <div style="margin:28px 0;">${button(verifyUrl, "Verify Email")}</div>
    <p style="margin:0 0 8px;font-size:13px;color:${BRAND.muted};">
      This link expires in <strong>24 hours</strong>.
    </p>
    <p style="margin:0;font-size:13px;color:${BRAND.muted};">
      If the button doesn't work, copy and paste this URL into your browser:<br/>
      <a href="${verifyUrl}" style="color:${BRAND.accent};word-break:break-all;">${verifyUrl}</a>
    </p>`;

  const text = [
    `Verify your MockMate account`,
    ``,
    `Hi ${username || "there"}, welcome to MockMate!`,
    `Confirm your email by opening this link (expires in 24 hours):`,
    verifyUrl,
    ``,
    `If you didn't sign up, you can ignore this email.`,
  ].join("\n");

  return {
    subject: "Verify your MockMate account",
    html: baseLayout({ heading, bodyHtml }),
    text,
  };
};
