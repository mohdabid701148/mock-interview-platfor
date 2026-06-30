// Single source of truth for allowed CORS origins, shared by the REST layer
// (app.js) and Socket.IO (socket.js). Supports a comma-separated CORS_ORIGIN so
// multiple frontends (local dev + Vercel preview + production) work consistently
// across both HTTP and WebSocket — previously the REST CORS treated the whole
// comma-separated string as a single origin and silently broke multi-origin setups.
export const getAllowedOrigins = () => {
  const origins = process.env.CORS_ORIGIN || "http://localhost:5173";

  return origins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};
