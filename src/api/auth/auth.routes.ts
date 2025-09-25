import { Router } from "express";
import { register, login, getAllUsers } from "./auth.controller";
import upload from "../../middlewares/multer";
export const authRouter = Router();

authRouter.post("/register", upload.single("image"), register);
authRouter.post("/login", login);
authRouter.get("/getAll", getAllUsers);
