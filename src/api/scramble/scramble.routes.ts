import { Router } from "express";
import { getDailyScramble } from "./scramble.controller";

const scrambleRouter = Router();

scrambleRouter.get("/daily", getDailyScramble);

export default scrambleRouter;
