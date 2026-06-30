import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import authRoutes from "./routes/auth.routes.js";
import scheduleRouter from "./routes/schedule.routes.js";
import roomRoutes from "./routes/room.routes.js";
import feedbackRoutes from "./routes/feedback.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import codeExecutionRoutes from "./routes/codeExecution.routes.js";
import { ApiError } from "./utils/ApiError.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import { getAllowedOrigins } from "./config/allowedOrigins.js";
import {
  authLimiter,
  roomScheduleLimiter,
  generalLimiter,
} from "./middlewares/rateLimiter.middleware.js";

const app = express();

// Behind Render's proxy (and optionally Cloudflare): trust the first proxy hop so
// express-rate-limit keys on the real client IP and secure cookies detect HTTPS
// via X-Forwarded-Proto.
app.set("trust proxy", 1);

// Security Headers with Helmet (monaco-editor & socket.io compatibility)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          "https://cdn.jsdelivr.net",
          "https://cdnjs.cloudflare.com",
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
          "https://cdn.jsdelivr.net",
        ],
        connectSrc: [
          "'self'",
          "ws://localhost:5000",
          "wss://localhost:5000",
          "http://localhost:5000",
          "https://localhost:5000",
          "http://localhost:5173",
          "ws://localhost:5173",
          "wss://*",
          "https://*",
        ],
        imgSrc: ["'self'", "data:", "https:"],
        fontSrc: [
          "'self'",
          "https://fonts.gstatic.com",
          "https://cdn.jsdelivr.net",
        ],
        workerSrc: ["'self'", "blob:"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// 150kb body limit leaves headroom for ~100KB code submissions plus the JSON
// wrapper, stdin, and test-case payload sent to /api/v1/code.
app.use(express.json({ limit: "150kb" }));
app.use(express.urlencoded({ extended: true, limit: "150kb" }));

app.use(cookieParser());

app.use(
  cors({
    origin: getAllowedOrigins(),
    credentials: true,
  })
);

// Apply general rate limit to all routes
app.use(generalLimiter);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Route specific rate limiters applied
app.use("/api/v1/auth", authLimiter, authRoutes);
app.use("/api/v1/rooms", roomScheduleLimiter, roomRoutes);
app.use("/api/v1/schedule", roomScheduleLimiter, scheduleRouter);
app.use("/api/v1/feedback", feedbackRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/code", codeExecutionRoutes);

app.use((req, res, next) => {
  next(new ApiError(404, "Route not found"));
});

// Centralized error handler: maps ApiError / Mongoose / JWT errors to consistent
// responses, masks unexpected 500 messages (no internal/stack leakage), and logs
// unhandled errors. Replaces the previous inline handler that leaked raw error
// messages and logged nothing.
app.use(errorMiddleware);

export default app;