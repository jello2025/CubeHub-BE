import express from "express";
import dotenv from "dotenv";
import connectDB from "./database";
import cors from "cors";
import morgan from "morgan";
import { env } from "./config/env";
import { notFound } from "./middlewares/notFound";
import { errorHandler } from "./middlewares/errorHandler";
import { authRouter } from "./api/auth/auth.routes";

const app = express();
dotenv.config();
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
connectDB();

app.use("/api/auth", authRouter);

const PORT = env.PORT || "5000";
const DB_URL = env.DB_URL;

if (!DB_URL) {
  throw new Error("DB_URL is not defined in environment variables");
}
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log("server is running");
});
