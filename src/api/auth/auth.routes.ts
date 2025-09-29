import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import {
  register,
  login,
  getAllUsers,
  getUser,
  updateUserById,
} from "./auth.controller";
import upload from "../../middlewares/multer";
export const authRouter = Router();

authRouter.post("/register", upload.single("image"), register);
authRouter.post("/login", login);
authRouter.get("/getAll", getAllUsers);
authRouter.get("/myProfile", authenticate, getUser);
authRouter.put("/userId", updateUserById);
