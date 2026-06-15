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
