import { Router } from "express";
import {
  register,
  login,
  logout,
  getProfile,
  forgotPassword,
  resetPassword,
  changePassword,
  updateUser,
} from "../controllers/usercontroller.js";
import upload from "../middleware/multer.middleware.js";
import isLoggedIn from "../middleware/auth.middleware.js";
const userRouter = Router();

userRouter.post("/register", upload.single("avatar"), register);
userRouter.post("/login", login);
userRouter.get("/logout", logout);
userRouter.get("/me", isLoggedIn, getProfile);
userRouter.post("/forgotpassword", forgotPassword);
userRouter.post("/resetpassword/:resetToken", resetPassword);
userRouter.post("/changepassword", isLoggedIn, changePassword);
userRouter.put("/update", isLoggedIn, upload.single("avatar"), updateUser);

export default userRouter;
