import dotenv from "dotenv";
dotenv.config();

if (!process.env.MONGODB_URI) {
  throw new Error("Missing DB_URL in environment");
}

if (!process.env.JWT_EXP) {
  throw new Error("Missing JWT in environment");
}

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY in environment");
}
export const env = {
  PORT: process.env.PORT || "5000",
  DB_URL: process.env.MONGODB_URI,
  JWT_EXP: process.env.JWT_EXP,
  JWT_SECRET: process.env.JWT_SECRET,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
};
