import { Request, Response, NextFunction } from "express";
import User from "../../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, password, image, email, ao5, ao12, single } = req.body;
    const imagePath = req.file ? req.file.path : null;
    if (!username || !password || !email) {
      next({
        status: 400,
        message: "missing creds",
      });
    }

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return next({
        status: 400,
        message: "username already exists",
      });
    }
    const emaiExists = await User.findOne({ email });
    if (emaiExists) {
      return next({ status: 400, message: "email already exists" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = await User.create({
      ...req.body,
      image: imagePath,
      username,
      email,
      passwaord: hashedPassword,
      ao12: ao12,
      ao5: ao5,
      single: single,
    });

    const payload = {
      userId: newUser._id,
      username: username,
      email: email,
    };
    const secret = env.JWT_SECRET;
    const options = { expiresIn: env.JWT_EXP } as jwt.SignOptions;
    const token = jwt.sign(payload, secret as string, options);

    res.status(201).json({
      username: username,
      email: email,
      password: hashedPassword,
      token: token,
      image: imagePath,
      ao12: ao12,
      ao5: ao5,
      single: single,
    });
  } catch (err) {
    next(err);
  }
};

export const updateUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;
  try {
    const foundUser = await User.findById(userId);
    if (foundUser) {
      await foundUser.updateOne(req.user);
      res.status(204).end();
    } else {
      res.status(404).json({ message: "user not found" });
    }
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      next({
        status: 400,
        message: "missing creds",
      });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return next({
        status: 404,
        message: "couldnt find user",
      });
    }

    const isMatch = await bcrypt.compare(password, user?.passwaord as string);

    if (!isMatch) {
      next({
        status: 400,
        message: "invalid creds",
      });
    }

    const payload = { userId: user._id, username: username };
    const secret = env.JWT_SECRET;
    const options = { expiresIn: env.JWT_EXP } as jwt.SignOptions;
    const token = jwt.sign(payload, secret as string, options);
    res.status(200).json({
      token: token,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await User.find();
    return res.json(users);
  } catch (err) {
    next(err);
  }
};

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  return res.status(200).json({
    username: user?.username,
    image: user?.image,
    ao5: user?.ao5,
    ao12: user?.ao12,
    single: user?.single,
    scrambles: user?.scrambles,
    attempts: user?.attempts,
  });
};

export const deleteById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;
  try {
    const foundUser = await User.findById(userId);
    if (foundUser) {
      await foundUser.deleteOne();
      res.status(204).end();
    } else {
      res.status(404).json({ message: "user not found" });
    }
  } catch (err) {
    next(err);
  }
};

export const deleteManyUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userIds } = req.body;
  try {
    const result = await User.deleteMany({ _id: { $in: userIds } });
    if (result.deletedCount > 0) {
      res
        .status(200)
        .json({ message: `${result.deletedCount} users deleted.` });
    } else {
      res.status(404).json({ message: "No users found to delete." });
    }
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;
  try {
    const foundUser = await User.findById(userId);
    res.status(200).json(foundUser);
  } catch (err) {
    next(err);
  }
};
