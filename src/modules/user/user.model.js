const { Schema, model } = require("mongoose");
const config = require("../../config");
const bcrypt = require("bcrypt");

const userModel = new Schema(
  {
    firstName: {
      type: String,
      default: null,
    },
    lastName: {
      type: String,
      default: null,
    },
    userName: {
      type: String,
      required: [true, "Username is required"],
    },
    email: {
      type: String,
      required: true,
      unique: [true, "Email is required"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    phone: {
      type: String,
      default: null,
      unique: [true, "Phone number must be unique"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    ageVerification: {
      type: Boolean,
      default: false,
      required: true,
    },
    country: {
      type: String,
      default: null,
    },
    state: {
      type: String,
      default: null,
    },
    city: {
      type: String,
      default: null,
    },
    address: {
      type: String,
      default: null,
    },
    texId: {
      type: String,
      default: null,
    },
    points: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    imageLink: { type: String, default: null },
    otp: { type: String, default: null },
    otpExpires: { type: Date, default: null },
    resetPasswordOtp: { type: String, default: null },
    resetPasswordOtpExpires: { type: Date, default: null },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true, versionKey: false }
);

userModel.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userModel.post("save", function (doc, next) {
  doc.password = "";
  next();
});

const User = model("User", userModel);
module.exports = User;
