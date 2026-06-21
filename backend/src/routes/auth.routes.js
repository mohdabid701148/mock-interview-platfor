import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser ,userUpdate, getProfile, verifyEmail, resendVerification} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { resendVerificationLimiter } from "../middlewares/rateLimiter.middleware.js";
import { validate, resendVerificationSchema, verifyEmailParamSchema } from "../middlewares/validation.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/logout").post(verifyJWT,logoutUser);
router.route("/current-user").get(verifyJWT, getProfile);
router.route("/update").patch(verifyJWT, userUpdate);

// Email verification
router.route("/verify-email/:token").get(validate(verifyEmailParamSchema), verifyEmail);
router.route("/resend-verification").post(resendVerificationLimiter, validate(resendVerificationSchema), resendVerification);

export default router