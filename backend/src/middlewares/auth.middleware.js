import { User } from "../models/User.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";

const verifyJWT = asyncHandler(async (req, _, next) => {

    // Access token is sent ONLY as a Bearer header (held in SPA memory). It is
    // never stored in a cookie, so there is no cookie fallback here.
    const authHeader = req.headers?.authorization || "";
    const token = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7).trim()
        : null;

    if (!token) {
        throw new ApiError(401, "Unauthorized request");
    }
    let decodedToken;
    try {

        decodedToken = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET
        );

    } catch (error) {
        throw new ApiError(401, "Invalid access token");
    }

    const user = await User.findById(decodedToken?._id).select(
        "-password -refreshToken"
    );

    if (!user) {
        throw new ApiError(401, "User not found");
    }

    req.user = user;
    next();
});

export { verifyJWT };

