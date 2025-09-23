import dotenv from "dotenv";
dotenv.config();

if (!process.env.DB_URL) {
  throw new Error("Missing DB_URL in environment");
}

export const env = {
  PORT: process.env.PORT || "5000",
  DB_URL: process.env.DB_URL,
  JWT_EXP: process.env.JWT_EXP,
  JWT_SECRET: process.env.JWT_SECRET,
};
