import { Schema, model } from "mongoose";

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "username is required"],
      unique: [true],
      trim: true,
      maxLength: [20, "usename must be less than 20 characters"],
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: [true, "already Registered"],
      lowercase: true,
      trim: true,
      //yahan pr regex use kr sakte hain match:[under regex likh do]krke
    },
    password: {
      type: String,
      required: [true, "password is required"],
      minLength: [5, "password less than 5 characters not allowed"],
      select: false,
    },
    confirmPassword: {
      type: String,
      required: [true, " confirm password is required"],
      select: false,
    },

    avatar: {
      public_id: {
        type: "String",
      },
      secure_url: {
        type: "String",
      },
    },
    role: {
      type: "String",
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
    forgotPasswordToken: {
      type: String,
    },
    forgotPasswordExpiryDate: {
      type: Date,
    },
    subscription: {
      id: String,
      status: String,
    },
  },
  {
    timestamps: true,
  }
);
//encryption of password in a database
//pre is a hook which is used to run the function when any work is do be done or if you have to do something any function being to be executed before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  if (!this.isModified("confirmPassword")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  this.confirmPassword = await bcrypt.hash(this.confirmPassword, 10);
  return next();
});

//generating token jwt

userSchema.methods = {
  generateJWTToken: async function () {
    const token = await jwt.sign(
      {
        id: this._id,
        email: this.email,
        subscription: this.subscription,
        role: this.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRY,
      }
    );
    return token;
  },
  generatePasswordResetToken: async function () {
    //for generating a token
    const resetToken = crypto.randomBytes(20).toString("hex");
    //for encrypting the generated token
    this.forgotPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    this.forgotPasswordExpiryDate = Date.now() + 15 * 60 * 1000; //15 min from now token will expire

    return resetToken;
  },
};
const User = model("User", userSchema);
export default User;
