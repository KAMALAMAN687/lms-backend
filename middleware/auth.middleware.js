import jwt from "jsonwebtoken";
import AppError from "../utils/error.util.js";

const isLoggedIn = async (req, res, next) => {
  try {
    const token = await req.cookies["token"];

    if (!token) {
      return next(new AppError("Unauthenticated ,please login again", 401));
    }
    const userDetails = await jwt.verify(token, process.env.JWT_SECRET);
    req.user = userDetails;
    next();
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

export default isLoggedIn;
