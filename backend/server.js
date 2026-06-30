// Load .env FIRST, before any other module is imported, so env vars are
// available to modules that read process.env at import time (e.g. email.service.js).
import "dotenv/config";
import http from "http";
import mongoose from "mongoose";
import app from "./src/app.js";
import db_connect from "./src/config/db.js";
import { initializeSocket } from "./src/config/socket.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await db_connect();

  const server = http.createServer(app);

  // Handle port-in-use without crashing the process ungracefully
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `\n[server] Port ${PORT} is already in use.\n` +
        `Run: npx kill-port ${PORT}  (or restart your terminal)\n`
      );
      process.exit(1);
    }
    throw err;
  });

  const io = initializeSocket(server);

  server.listen(PORT, () => {
    console.log(`[server] Running on port ${PORT}`);
  });

  // ── Graceful shutdown ──────────────────────────────────────────────────────
  // On SIGTERM (Render redeploys/scales) or SIGINT (Ctrl+C), stop accepting new
  // connections, close sockets, drain the DB connection, then exit. A hard
  // timeout guarantees the process eventually exits even if something hangs.
  let shuttingDown = false;
  const shutdown = (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`[server] ${signal} received — shutting down gracefully`);

    const forceExit = setTimeout(() => {
      console.error("[server] graceful shutdown timed out — forcing exit");
      process.exit(1);
    }, 10000);
    forceExit.unref();

    io.close(() => {
      server.close(async () => {
        try {
          await mongoose.connection.close();
        } catch (err) {
          console.error("[server] error closing MongoDB connection:", err.message);
        }
        console.log("[server] shutdown complete");
        process.exit(0);
      });
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
};

// ── Process-level safety nets ────────────────────────────────────────────────
// Log (don't silently swallow) unexpected failures. An uncaught exception leaves
// the process in an undefined state, so we exit and let the platform restart it.
process.on("unhandledRejection", (reason) => {
  console.error("[server] Unhandled Promise Rejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("[server] Uncaught Exception:", err);
  process.exit(1);
});

startServer();
