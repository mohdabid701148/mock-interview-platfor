import {User} from "../models/User.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

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

  const createdUser = await User.findById(user._id)
    .select("-password -refreshToken");

  if (!createdUser) {
    throw new ApiError(
      500,
      "Something went wrong while registering user"
    );
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      createdUser,
      "User registered successfully"
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
};