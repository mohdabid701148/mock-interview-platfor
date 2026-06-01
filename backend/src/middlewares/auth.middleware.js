import {User} from "../models/User.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import jwt from "jsonwebtoken";

const verifyJWT = asyncHandler(async (req, _, next) => {

    const token =
        req.cookies?.accessToken ||
        req.headers?.authorization?.replace("Bearer ", "");

    if (!token) {
        throw new ApiError(401, "Unauthorized request");
    }
    console.log("TOKEN:", token);
    let decodedToken;
    try {

        decodedToken = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET
        );
        console.log("DECODED:", decodedToken);

    } catch (error) {
        console.log("JWT ERROR:", error);
        throw new ApiError(401, "Invalid access token");
    }

    const user = await User.findById(decodedToken?._id).select(
        "-password -refreshToken"
    );

    if (!user) {
        throw new ApiError(401, "User not found");
    }

    req.user = user;
    console.log("USER FOUND:", user?.username);
    next();
});

export { verifyJWT };