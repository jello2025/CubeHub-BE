import { Router } from "express";
import {
  getAllPosts,
  createPost,
  getUserPosts,
  deleteAttemptById,
} from "./posts.controller";

export const postRouter = Router();

postRouter.get("/", getAllPosts);
postRouter.post("/", createPost);
postRouter.get("/:userId", getUserPosts);
postRouter.delete("/:attemptId", deleteAttemptById);
