import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import authRoutes from "./routes/auth.routes.js";
import scheduleRouter from "./routes/schedule.routes.js";
import roomRoutes from "./routes/room.routes.js";
import feedbackRoutes from "./routes/feedback.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import { ApiError } from "./utils/ApiError.js";
import {
  authLimiter,
  roomScheduleLimiter,
  generalLimiter,
} from "./middlewares/rateLimiter.middleware.js";

const app = express();

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

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

// Apply general rate limit to all routes
app.use(generalLimiter);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running 🚀",
  });
});

// Route specific rate limiters applied
app.use("/api/v1/auth", authLimiter, authRoutes);
app.use("/api/v1/rooms", roomScheduleLimiter, roomRoutes);
app.use("/api/v1/schedule", roomScheduleLimiter, scheduleRouter);
app.use("/api/v1/feedback", feedbackRoutes);
app.use("/api/v1/notifications", notificationRoutes);

app.use((req, res, next) => {
  next(new ApiError(404, "Route not found"));
});

app.use((err, req, res, next) => {
  console.log("ERROR HANDLER next type:", typeof next);
  console.log("ERROR:", err);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    errors: err.errors || [],
  });
});

export default app;