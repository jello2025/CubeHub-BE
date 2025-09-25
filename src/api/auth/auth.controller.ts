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
    const { username, password, email } = req.body;
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
    });

    const payload = { userId: newUser._id, username: username, email: email };
    const secret = env.JWT_SECRET;
    const options = { expiresIn: env.JWT_EXP } as jwt.SignOptions;
    const token = jwt.sign(payload, secret as string, options);

    res.status(201).json({
      username: username,
      email: email,
      password: hashedPassword,
      token: token,
    });
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
    return res.json({ users });
  } catch (err) {
    next(err);
  }
};
