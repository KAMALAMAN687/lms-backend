import User from "../model/userSchema.js";
import AppError from "../utils/error.util.js";

const authorizedSubscriber = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const subscription = user.subscription;
  const currentUserRoles = user.role;
  if (currentUserRoles !== "ADMIN" && subscription.status !== "active") {
    return next(new AppError("Please Subscribe To access this Route", 403));
  }
  next();
};
export default authorizedSubscriber;
