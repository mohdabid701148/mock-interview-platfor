import app from "./src/app.js";
import dotenv from "dotenv";
import db_connect from "./src/config/db.js";
dotenv.config();

const PORT = process.env.PORT||5000;

const startServer = async () => {
  await db_connect();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();