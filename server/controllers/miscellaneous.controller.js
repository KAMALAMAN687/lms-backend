import Contact from "../model/contactSchema.js";
import User from "../model/userSchema.js";
import AppError from "../utils/error.util.js";

const contactUs = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;
    if (!email || !name || !message) {
      return next(new AppError("All fields are Requires", 400));
    }
    const contact = await Contact.create({
      name,
      email,
      message,
    });
    if (!contact) {
      return next(
        new AppError("Your Message not send to the Admin ,Try Again", 500)
      );
    }

    res.status(200).json({
      success: true,
      message: "Message Sent Successfully",
      contact,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};
const userStats = async (req, res, next) => {
  try {
    const allUsersCount = await User.countDocuments();
    const subscribedUserCount = await User.countDocuments({
      "subscription.status": "active",
    });

    res.status(200).json({
      success: true,
      message: "All registered user count",
      allUsersCount,
      subscribedUserCount,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};
export { contactUs, userStats };
