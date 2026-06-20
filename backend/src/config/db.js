import mongoose from "mongoose";

// Log connection lifecycle so Atlas drops/reconnects (common on free tier) are
// visible in Render logs. The driver auto-reconnects; we only observe here.
mongoose.connection.on("disconnected", () => {
  console.error("[db] MongoDB disconnected — driver will attempt to reconnect");
});
mongoose.connection.on("reconnected", () => {
  console.log("[db] MongoDB reconnected");
});
mongoose.connection.on("error", (err) => {
  console.error("[db] MongoDB connection error:", err.message);
});

const db_connect = async () => {
  if (!process.env.MONGODB_URI) {
    console.error("[db] MONGODB_URI is not set");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // fail fast if Atlas is unreachable
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });
    console.log(`MongoDB connected: ${conn.connection.host} ${conn.connection.name}`);
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

export default db_connect;