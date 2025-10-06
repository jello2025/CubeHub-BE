import { Router } from "express";
import {
  getDailyScramble,
  submitSolve,
  getAllAttempts,
  createAttempt,
} from "./scramble.controller";

const scrambleRouter = Router();

scrambleRouter.get("/daily", getDailyScramble);
scrambleRouter.post("/submit", submitSolve);
scrambleRouter.get("/attempts", getAllAttempts);
scrambleRouter.post("/", createAttempt);

export default scrambleRouter;
