import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser ,userUpdate, getProfile, verifyEmail, resendVerification} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { resendVerificationLimiter, verifyCodeLimiter } from "../middlewares/rateLimiter.middleware.js";
import { validate, resendVerificationSchema, verifyEmailSchema } from "../middlewares/validation.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/logout").post(verifyJWT,logoutUser);
router.route("/current-user").get(verifyJWT, getProfile);
router.route("/update").patch(verifyJWT, userUpdate);

// Email verification (6-digit code)
router.route("/verify-email").post(verifyCodeLimiter, validate(verifyEmailSchema), verifyEmail);
router.route("/resend-verification").post(resendVerificationLimiter, validate(resendVerificationSchema), resendVerification);

export default router