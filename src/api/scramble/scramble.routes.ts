import { Router } from "express";
import {
  getDailyScramble,
  submitSolve,
  getAllAttempts,
  createAttempt,
  getLeaderboard,
} from "./scramble.controller";
import { authenticate } from "../../middlewares/authenticate";

const scrambleRouter = Router();

scrambleRouter.get("/daily", getDailyScramble);
scrambleRouter.post("/submit", authenticate, submitSolve);
scrambleRouter.get("/attempts", getAllAttempts);
scrambleRouter.post("/", authenticate, createAttempt);
scrambleRouter.get("/leaderboard", getLeaderboard);

export default scrambleRouter;
