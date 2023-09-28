import AppError from "../utils/error.util.js";

const authorizedRoles =
  (...roles) =>
  async (req, res, next) => {
    const currentUserRoles = req.user.role;
    if (!roles.includes(currentUserRoles)) {
      return next(
        new AppError("You do not have Permission to Access this Route", 403)
      );
    }
    next();
  };
export default authorizedRoles;
