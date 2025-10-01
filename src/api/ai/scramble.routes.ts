import express from "express";
import { getScramble } from "./scramble.controller";
import { Router } from "express";

const scrambleRouter = Router();

scrambleRouter.get("/scramble", getScramble);

export default scrambleRouter;
