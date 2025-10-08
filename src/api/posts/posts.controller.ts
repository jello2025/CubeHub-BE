import { Request, Response, NextFunction } from "express";
import Post from "../../models/Post";
import User from "../../models/User";

export const createPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const newPost = await Post.create({
      ...req.body,
      user: req.user,
    });

    await User.findByIdAndUpdate(req.user, {
      $push: { posts: newPost._id },
    });

    res.status(201).json(newPost);
  } catch (err) {
    next(err);
  }
};

export const getAllPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const posts = await Post.find().populate("user", "username image");

    return res.status(200).json(posts);
  } catch (err) {
    next(err);
  }
};

export const getUserPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.params.userId;
    const posts = await Post.find({ user: userId }).sort({ date: -1 }); // newest first
    return res.status(200).json(posts);
  } catch (err) {
    next(err);
  }
};
