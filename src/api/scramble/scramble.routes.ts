import { Router } from "express";
import {
  getDailyScramble,
  submitSolve,
  getAllAttempts,
  createAttempt,
  getLeaderboard,
  getUserScrambleHistory,
  deleteAttempt,
} from "./scramble.controller";
import { authenticate } from "../../middlewares/authenticate";

const scrambleRouter = Router();

scrambleRouter.get("/daily", getDailyScramble);
scrambleRouter.post("/submit", authenticate, submitSolve);
scrambleRouter.get("/attempts", getAllAttempts);
scrambleRouter.post("/", authenticate, createAttempt);
scrambleRouter.get("/leaderboard", getLeaderboard);
scrambleRouter.get("/:userId/history", getUserScrambleHistory);
scrambleRouter.delete("/:attemptId", deleteAttempt);

export default scrambleRouter;
