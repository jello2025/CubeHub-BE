import express from "express";
import dotenv from "dotenv";
import connectDB from "./database";
import cors from "cors";
import morgan from "morgan";
import { env } from "./config/env";
import { notFound } from "./middlewares/notFound";
import { errorHandler } from "./middlewares/errorHandler";
import { authRouter } from "./api/auth/auth.routes";
import scrambleRouter from "./api/scramble/scramble.routes";
import path from "path";
const app = express();
dotenv.config();
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

connectDB();

app.use("/api/auth", authRouter);
app.use("/api/scramble", scrambleRouter);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

const PORT = env.PORT || "5000";

app.use(notFound);
app.use(errorHandler);
app.listen(PORT, () => {
  console.log("server is running");
});
