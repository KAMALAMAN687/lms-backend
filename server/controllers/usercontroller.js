const errorMiddleware = require("../middleware/error.middleware.js");
const User = require("../model/userSchema.js");
const emailValidator = require("email-validator");
const bcrypt = require("bcrypt");
const AppError = require("../utils/error.util.js");

exports.register = async (req, res, next) => {
  try {
    const { username, email, password, confirmPassword } = req.body;
    if (!username || !email || !password || !confirmPassword) {
      return next(new AppError("All fields are required", 400));
    }

    //valid email

    const validEmail = emailValidator.validate(email);

    if (!validEmail) {
      return res.status(400).json({
        success: false,
        message: "Please Provide a Valid Email",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: "false",
        message: "password and confirm password is not match",
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(new AppError("Email Already Exists", 400));
    }

    const user = await User.create({
      username,
      email,
      password,
      confirmPassword,
      avatar: {
        public_id: email,
        secure_url: "",
      },
    });

    if (!user) {
      return next(new AppError("User Registration FAiled,please try again"));
    }

    //todo:file upload

    await user.save();
    user.password = undefined;
    user.confirmPassword = undefined;

    const token = await user.jwtToken();
    const cookieOption = {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
    };
    res.cookie("token", token, cookieOption);

    res
      .status(200)
      .json({ success: true, message: "user Signup Successfully", user });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (!username && !email) {
      return next(new AppError("username or email is not provided", 400));
    }

    if (!password) {
      return next(new AppError("password is required", 400));
    }

    const user = await User.findOne({ email }).select("+password");
    const userName = await User.findOne({ username }).select("+password");

    if (!user && !userName) {
      return next(new AppError("USer is not registered or signed up"));
    }
    if (user) {
      if (!(await bcrypt.compare(password, user.password))) {
        return next(new AppError("Password is not correct", 400));
      }
    } else {
      if (!(await bcrypt.compare(password, userName.password))) {
        return next(new AppError("Password is not  match", 400));
      }
    }
    if (user) {
      const token = user.jwtToken();
      user.password = undefined;

      const cookieOption = {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
      };

      res.cookie("token", token, cookieOption);
      res.status(200).json({
        success: true,
        data: user,
        message: "user login successfully",
      });
    } else {
      const token = userName.jwtToken();
      userName.password = undefined;

      const cookieOption = {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
      };

      res.cookie("token", token, cookieOption);

      res.status(200).json({
        success: true,
        data: userName,
        message: "user login successfully",
      });
    }

    res.status(200).json({
      success: true,
      data: userName,
      message: "user login successfully",
    });
  } catch (error) {
    return next(new AppError(e.message, 500));
  }
};

exports.logout = async (req, res, next) => {
  try {
    const cookieOption = {
      expiry: new Date(),
      httpOnly: true,
      secure: true,
    };
    res.cookie("token", null, cookieOption);
    res.status(200).json({
      success: true,
      message: "logged Out",
    });
  } catch (error) {
    return next(new AppError(e.message, 500));
  }
};

exports.getProfile = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
