import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken"
const verifyJWT = asyncHandler(async(req,_,next)=>{
    const token = req.cookies?.accessToken || req.headers?.authorization.replace("Bearer ","")
    if(!token){
        throw new ApiError(401,"Unautharized request");
    }
    
    let decodedToken ;
    try {
        decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
    } catch (error) {
        throw new ApiError(401,"invalid access token");
    }
    const user = await User.findById(decodedToken._id);
    if(!user){ 
        throw new ApiError(401,"user not found");
    }
    req.user = user;
    next();

})
export {verifyJWT};