const express = require("express");
const jwtAuth = require("../middleware/jwtAuth.js");
const {
  register,
  login,
  logout,
  getProfile,
} = require("../controllers/usercontroller.js");
const userRouter = express.Router();

userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.get("/logout", logout);
userRouter.post("/me", jwtAuth, getProfile);

module.exports = userRouter;
