import { Router } from "express";
import { getAllPosts, createPost, getUserPosts } from "./posts.controller";

export const postRouter = Router();

postRouter.get("/", getAllPosts);
postRouter.post("/", createPost);
postRouter.get("/:userId", getUserPosts);
