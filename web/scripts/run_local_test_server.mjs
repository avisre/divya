import process from "node:process";

const port = process.env.PORT || "3104";

process.env.MONGODB_URI = process.env.MONGODB_URI?.trim() || "mongodb+srv://project:project@cluster0.kos1k7l.mongodb.net/GOD1";
process.env.JWT_SECRET = process.env.JWT_SECRET?.trim() || "minimum-32-character-secret-key-2026";
process.env.JWT_EXPIRE = process.env.JWT_EXPIRE?.trim() || "30d";
process.env.NODE_ENV = process.env.NODE_ENV?.trim() || "production";
process.env.PORT = port;
process.env.NEXT_PUBLIC_SITE_URL = `http://127.0.0.1:${port}`;
process.env.NEXT_PUBLIC_BACKEND_ORIGIN = `http://127.0.0.1:${port}`;
process.env.BACKEND_API_BASE_URL = `http://127.0.0.1:${port}/api`;
process.env.PUBLIC_API_BASE_URL = `http://127.0.0.1:${port}`;
process.env.WEB_APP_URL = `http://127.0.0.1:${port}`;
process.env.CORS_ORIGINS = `http://127.0.0.1:${port}`;
process.env.TRUST_PROXY = "false";

await import("../server.mjs");
