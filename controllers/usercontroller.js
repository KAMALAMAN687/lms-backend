import errorMiddleware from "../middleware/error.middleware.js";
import User from "../model/userSchema.js";
import emailValidator from "email-validator";
import bcrypt from "bcrypt";
import AppError from "../utils/error.util.js";
import cloudinary from "cloudinary";
import fs from "fs/promises";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";

const register = async (req, res, next) => {
  try {
    const { username, email, password, confirmPassword } = req.body;
    if (!username || !email || !password || !confirmPassword) {
      return next(new AppError("All fields are required", 400));
    }

    //valid email

    const validEmail = emailValidator.validate(email);

    if (!validEmail) {
      //return next(new AppError("Please provide a valid email", 400));
      return res.status(400).json({
        success: "false",
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

    console.log("File Details =>", JSON.stringify(req.file));

    //todo:file upload
    if (req.file) {
      try {
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: "lms",
          width: 250,
          height: 250,
          gravity: "faces",
          crop: "fill",
        });

        if (result) {
          user.avatar.public_id = result.public_id;
          user.avatar.secure_url = result.secure_url;
          //Remove file from server
          fs.rm(`uploads/${req.file.filename}`);
        }
      } catch (error) {
        return next(
          new AppError(error || "File not uploaded, please try again", 500)
        );
      }
    }

    await user.save();
    user.password = undefined;
    user.confirmPassword = undefined;

    const token = await user.generateJWTToken();
    const cookieOption = {
      maxAge: 24 * 60 * 60 * 1000, //for one day
      httpOnly: true,
    };
    res.cookie("token", token, cookieOption);

    res
      .status(200)
      .json({ success: true, message: "User Signup Successfully", user });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const login = async (req, res, next) => {
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
      return next(new AppError("USer is not registered or signed up", 400));
    }
    if (user) {
      if (!(await bcrypt.compare(password, user.password))) {
        return next(new AppError("Email or Password is not correct", 400));
      }
    } else {
      if (!(await bcrypt.compare(password, userName.password))) {
        return next(new AppError("Password is not  match", 400));
      }
    }
    if (user) {
      user.password = undefined;
      const token = await user.generateJWTToken();
      const cookieOption = {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
      };

      res.cookie("token", token, cookieOption);
      res.status(200).json({
        success: true,
        message: "user login successfully",
        user,
      });
    } else {
      const token = userName.generateJWTToken();
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
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

const logout = async (req, res, next) => {
  try {
    const cookieOption = {
      expiry: new Date(),
      httpOnly: true,
      secure: true,
      maxAge: 0,
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

const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError("User Session Expired Login Again"));
    }
    return res.status(200).json({
      success: true,
      message: "user details",
      user,
    });
  } catch (error) {
    return next(new AppError("Not able to fetch Profile", 400));
  }
};

const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new AppError("Email is Required", 400));
  }
  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError("Email is not registered", 400));
  }
  const resetToken = await user.generatePasswordResetToken();
  await user.save();

  const resetPasswordURL = `${process.env.FRONTEND_URL}/resetPassword/${resetToken}`;
  console.log(resetPasswordURL);

  const subject = "Reset Password";

  const message = `You can Reset your Password by clicking <a href = ${resetPasswordURL} target="_blank">Reset Your Password</a> If the above link does not work for some reason then copy paste this link in new tab ${resetPasswordURL}.\n If you have not requested this, kindly ignore.`;
  try {
    await sendEmail(email, subject, message);

    res.status(200).json({
      success: true,
      message: `Rest password token has been sent to ${email} successfully`,
    });
  } catch (e) {
    user.forgotPasswordExpiryDate = undefined;
    user.forgotPasswordToken = undefined;

    await user.save();
    return next(new AppError(e.message, 500));
  }
};

const resetPassword = async (req, res, next) => {
  const { resetToken } = req.params;

  const { password } = req.body;

  if (!password) {
    return next(new AppError("please enter password first"));
  }

  const forgotPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const user = await User.findOne({
    forgotPasswordToken,
    forgotPasswordExpiryDate: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new AppError("Token is invalid or expired, please try again", 400)
    );
  }

  user.password = password;
  user.confirmPassword = password;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiryDate = undefined;

  await user.save();

  user.password = undefined;
  user.confirmPassword = undefined;

  res.status(200).json({
    success: true,
    message: "Password changed Successfully",
  });
};

const changePassword = async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  const { id } = req.user;
  if (!oldPassword || !newPassword) {
    return next(
      new AppError("old password or new password is not entered", 400)
    );
  }

  const user = await User.findById(id).select("+password");
  if (!user) {
    return next(new AppError("User does not exist", 400));
  }
  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordValid) {
    return next(new AppError("Invalid Old Password", 400));
  }
  user.password = newPassword;
  user.confirmPassword = newPassword;
  await user.save();

  user.password = undefined;
  user.confirmPassword = undefined;

  res.status(200).json({
    success: "true",
    message: "Password change Successfully",
  });
};

const updateUser = async (req, res, next) => {
  try {
    const { updatedname } = req.body;
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError("User does not exist", 400));
    }
    if (updatedname) {
      user.username = updatedname;
      await user.save();
    }

    if (req.file) {
      await cloudinary.v2.uploader.destroy(user.avatar.public_id);

      try {
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: "lms",
          width: 250,
          height: 250,
          gravity: "faces",
          crop: "fill",
        });

        if (result) {
          user.avatar.public_id = result.public_id;
          user.avatar.secure_url = result.secure_url;
          //Remove file from server
          fs.rm(`uploads/${req.file.filename}`);
        }
      } catch (error) {
        return next(
          new AppError(error || "File not uploaded, please try again", 500)
        );
      }
    }

    await user.save();

    res.status(200).json({
      success: "true",
      message: "Profile Updated Successfully !!",
      user,
    });
  } catch (error) {
    return next(new AppError("Not able to fetch Profile", 400));
  }
};
export {
  register,
  login,
  logout,
  getProfile,
  forgotPassword,
  resetPassword,
  changePassword,
  updateUser,
};
