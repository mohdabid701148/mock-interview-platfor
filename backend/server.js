import app from "./src/app.js";
import dotenv from "dotenv";
import http from "http";
import db_connect from "./src/config/db.js";
import { initializeSocket } from "./src/config/socket.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await db_connect();

  const server = http.createServer(app);

  initializeSocket(server);

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();