import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      trim: true,
      maxlength: 50,
    },

    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      
    },

    avatar: {
      type: String,
      default: "",
    },

    coverImage: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
      maxlength: 200,
    },

    status: {
      type: String,
      default: "Hey there! I am using ChatApp",
      maxlength: 100,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    

    refreshToken: {
      type: String,
      default: "",
    },

    // ─── Email verification ───────────────────────────────────────────
    isVerified: {
      type: Boolean,
      default: false,
    },

    // Stores only the SHA-256 HASH of the verification token, never the raw token.
    emailVerificationToken: {
      type: String,
      default: null,
      index: true,
    },

    emailVerificationExpiry: {
      type: Date,
      default: null,
    },

    notificationsEnabled: {
      type: Boolean,
      default: true,
    },

  },
  {
    timestamps: true,
  }
);



userSchema.pre("save", async function () {
  if (!this.isModified("password")) return ;

  this.password = await bcrypt.hash(this.password, 10);
  
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

// Generates a 6-digit verification code. Returns the RAW code (emailed to the
// user) but persists only its SHA-256 hash + a 15-minute expiry on the document.
// Caller is responsible for saving the document afterwards.
userSchema.methods.generateEmailVerificationCode = function () {
  const code = String(crypto.randomInt(100000, 1000000)); // always 6 digits

  this.emailVerificationToken = crypto
    .createHash("sha256")
    .update(code)
    .digest("hex");

  this.emailVerificationExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 min

  return code;
};

export const User =
  mongoose.models.User ||
  mongoose.model("User", userSchema);