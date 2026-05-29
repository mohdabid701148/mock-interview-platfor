import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";


import authRoutes from "./routes/auth.routes.js";

import roomRoutes from "./routes/room.routes.js";
import { ApiError } from "./utils/apiError.js";

const app = express();



app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);



app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running 🚀",
  });
});


app.use("/api/v1/auth", authRoutes);

app.use("/api/v1/rooms", roomRoutes);

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