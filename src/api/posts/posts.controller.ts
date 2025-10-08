import { Request, Response, NextFunction } from "express";
import Post from "../../models/Post";
import User from "../../models/User";
import Attempt from "../../models/Attempt";

export const createPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { image, description, user } = req.body;

    if (!image || !user) {
      return res.status(400).json({ message: "Image and user are required" });
    }

    // Create the new post
    const newPost = await Post.create({
      image,
      description,
      user,
    });

    // Add post ID to user's posts array
    await User.findByIdAndUpdate(user, { $push: { posts: newPost._id } });

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

export const deleteAttemptById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { attemptId } = req.params;
  try {
    const foundAttempt = await Attempt.findById(attemptId);
    if (foundAttempt) {
      await foundAttempt.deleteOne();
      res.status(204).end();
    } else {
      res.status(404).json({ message: "attempt not found" });
    }
  } catch (err) {
    next(err);
  }
};
