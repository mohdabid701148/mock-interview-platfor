import rateLimit from "express-rate-limit";

// Strict limits for login/register only (brute-force protection)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Only rate-limit destructive auth actions, not current-user/refresh
  skip: (req) => {
    const readPaths = ["/current-user", "/refresh-token"];
    return readPaths.some((p) => req.path.includes(p));
  },
});

// Moderate limits for room creation, joining, and scheduling
export const roomScheduleLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: {
    success: false,
    message: "Too many room or scheduling requests. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General rate limiting applied globally as a safety net
// Very generous because SPA frontends make many API calls per page
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: {
    success: false,
    message: "Too many requests. Please slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === "/health",
});

// Resend-verification: max 3 requests per hour, keyed by email (not IP) so one
// person can't spam a victim's inbox or burn through their own retries.
export const resendVerificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  keyGenerator: (req) =>
    `resend:${(req.body?.email || "").toLowerCase().trim()}`,
  message: {
    success: false,
    message: "Too many verification emails requested. Please try again in an hour.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  // We key by email, not IP, so the default IPv6 key check doesn't apply.
  validate: { keyGeneratorIpFallback: false },
});

// Verify-code attempts: max 10 per 15 min per email, to stop brute-forcing the
// 6-digit code (900k combinations would otherwise be guessable).
export const verifyCodeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  keyGenerator: (req) =>
    `verify:${(req.body?.email || "").toLowerCase().trim()}`,
  message: {
    success: false,
    message: "Too many verification attempts. Please request a new code and try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { keyGeneratorIpFallback: false },
});

// Strict limits for code execution to prevent abuse
export const codeExecutionLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20,
  message: {
    success: false,
    message: "Too many execution requests. Please wait a moment before trying again.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
