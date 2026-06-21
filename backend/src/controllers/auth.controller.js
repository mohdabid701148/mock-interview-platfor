import {User} from "../models/User.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sendVerificationEmail } from "../services/email.service.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
};

const registerUser = asyncHandler(async (req, res) => {

  const { email, username, password } = req.body;

  if (
    [email, username, password].some(
      (field) => !field || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const normalizedEmail = email.toLowerCase().trim();
  const trimmedUsername = username.trim();

  const existingUser = await User.findOne({
    $or: [
      { email: normalizedEmail },
      { username: trimmedUsername },
    ],
  });

  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }

  const user = await User.create({
    email: normalizedEmail,
    username: trimmedUsername,
    password,
  });

  // Generate verification code (raw is emailed, only the hash is stored).
  const code = user.generateEmailVerificationCode();
  await user.save({ validateBeforeSave: false });

  // Send the verification email. If delivery fails, the account still exists
  // (unverified) so the user can request a fresh code via /resend-verification.
  try {
    await sendVerificationEmail({
      to: user.email,
      username: user.username,
      code,
    });
  } catch (err) {
    console.error("[register] verification email failed:", err.message);
    throw new ApiError(
      502,
      "Account created, but we couldn't send the verification code. Please use 'Resend code' to try again."
    );
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      { email: user.email },
      "Verification code sent to your email. Please enter it to verify."
    )
  );
});

/* ================= LOGIN ================= */

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (
    [email, password].some(
      (field) => !field || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({
    email: normalizedEmail,
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid =
    await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  // Block login until the email is verified (checked after password so we don't
  // reveal verification status to someone guessing credentials).
  if (!user.isVerified) {
    throw new ApiError(403, "Please verify your email before logging in.");
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;

  await user.save({
    validateBeforeSave: false,
  });

  const loggedInUser = await User.findById(user._id)
    .select("-password -refreshToken");

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

/* ================= REFRESH TOKEN ================= */

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken ||
    req.body?.refreshToken ||
    req.headers?.authorization?.replace("Bearer ", "");

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  let decodedToken;

  try {
    decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
  } catch {
    throw new ApiError(401, "Invalid refresh token");
  }

  const user = await User.findById(decodedToken._id);

  if (!user) {
    throw new ApiError(401, "Invalid refresh token");
  }

  if (user.refreshToken !== incomingRefreshToken) {
    throw new ApiError(
      401,
      "Refresh token expired or already used"
    );
  }

  const newAccessToken = user.generateAccessToken();
  const newRefreshToken = user.generateRefreshToken();

  user.refreshToken = newRefreshToken;

  await user.save({
    validateBeforeSave: false,
  });
  return res
    .status(200)
    .cookie("accessToken", newAccessToken, cookieOptions)
    .cookie("refreshToken", newRefreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
        "Tokens refreshed successfully"
      )
    );
});

/* ================= LOGOUT ================= */

const logoutUser = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    throw new ApiError(401, "Unauthorized request");
  }

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      returnDocument: "after",
    }
  );
  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(
      new ApiResponse(
        200,
        {},
        "Logged out successfully"
      )
    );
});

/* ================= VERIFY EMAIL ================= */

const verifyEmail = asyncHandler(async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    throw new ApiError(400, "Email and verification code are required");
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Hash the incoming code and match it against the stored hash for this email.
  const hashedCode = crypto
    .createHash("sha256")
    .update(String(code).trim())
    .digest("hex");

  const user = await User.findOne({
    email: normalizedEmail,
    emailVerificationToken: hashedCode,
    emailVerificationExpiry: { $gt: new Date() },
  });

  // Generic message — don't reveal whether the code was wrong vs expired.
  if (!user) {
    throw new ApiError(400, "Invalid or expired verification code");
  }

  user.isVerified = true;
  user.emailVerificationToken = null;
  user.emailVerificationExpiry = null;

  await user.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(
      200,
      {},
      "Email verified successfully. You can now log in."
    )
  );
});

/* ================= RESEND VERIFICATION ================= */

const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Always return the same response to prevent account enumeration.
  const genericResponse = () =>
    res.status(200).json(
      new ApiResponse(
        200,
        {},
        "If an unverified account exists for this email, a new verification code has been sent."
      )
    );

  const user = await User.findOne({ email: normalizedEmail });

  if (!user || user.isVerified) {
    return genericResponse();
  }

  const code = user.generateEmailVerificationCode();
  await user.save({ validateBeforeSave: false });

  try {
    await sendVerificationEmail({
      to: user.email,
      username: user.username,
      code,
    });
  } catch (err) {
    // Log but still return the generic response (don't leak send status).
    console.error("[resend-verification] email failed:", err.message);
  }

  return genericResponse();
});

/* ================= CURRENT USER ================= */

const getProfile = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    throw new ApiError(401, "Unauthorized request");
  }

  const user = await User.findById(req.user._id)
    .select("-password -refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      user,
      "User fetched successfully"
    )
  );
});

/* ================= UPDATE USER ================= */

const userUpdate = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    throw new ApiError(401, "Unauthorized request");
  }

  const {
    fullName,
    bio,
    status,
    avatar,
    coverImage,
    notificationsEnabled,
  } = req.body;

  const updateFields = {};

  if (fullName !== undefined)
    updateFields.fullName = fullName;

  if (bio !== undefined)
    updateFields.bio = bio;

  if (status !== undefined)
    updateFields.status = status;

  if (avatar !== undefined)
    updateFields.avatar = avatar;

  if (coverImage !== undefined)
    updateFields.coverImage = coverImage;


  if (notificationsEnabled !== undefined)
    updateFields.notificationsEnabled =
      notificationsEnabled;

  const updatedUser = await User.findByIdAndUpdate(
  req.user._id,
  {
    $set: updateFields,
  },
  {
    returnDocument: "after",
    runValidators: true,
  }
).select("-password -refreshToken");

  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      updatedUser,
      "Profile updated successfully"
    )
  );
});

export {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getProfile,
  userUpdate,
  verifyEmail,
  resendVerification,
};