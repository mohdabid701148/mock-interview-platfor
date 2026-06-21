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

// Generates a high-entropy verification token. Returns the RAW token (sent in the
// email link) but persists only its SHA-256 hash + a 24h expiry on the document.
// Caller is responsible for saving the document afterwards.
userSchema.methods.generateEmailVerificationToken = function () {
  const rawToken = crypto.randomBytes(32).toString("hex");

  this.emailVerificationToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  this.emailVerificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  return rawToken;
};

export const User =
  mongoose.models.User ||
  mongoose.model("User", userSchema);