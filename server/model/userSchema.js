const mongoose = require("mongoose");
const JWT = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "username is required"],
      unique: true,
      trim: true,
      maxLength: [20, "usename must be less than 20 characters"],
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      //yahan pr regex use kr sakte hain match:[under regex likh do]krke
    },
    password: {
      type: String,
      required: [true, "password is required"],
      maxLength: [50, "password less than 10 characters"],
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
  },
  {
    timestamps: true,
  }
);
//encryption oof password in a database
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
  jwtToken() {
    return (
      JWT.sign(
        {
          id: this._id,
          email: this.email,
          subscription: this.subscription,
          role: this.role,
        },
        process.env.JWT_SECRET
      ),
      {
        expiresIn: process.env.JWT_EXPIRY,
      }
    );
  },
};

module.exports = mongoose.model("User", userSchema);
