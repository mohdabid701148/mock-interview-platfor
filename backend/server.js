// Load .env FIRST, before any other module is imported, so env vars are
// available to modules that read process.env at import time (e.g. email.service.js).
import "dotenv/config";
import app from "./src/app.js";
import http from "http";
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

  initializeSocket(server);

  server.listen(PORT, () => {
    console.log(`[server] Running on port ${PORT}`);
  });
};

startServer();
