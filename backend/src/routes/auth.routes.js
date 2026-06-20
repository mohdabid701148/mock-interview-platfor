import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser ,userUpdate, getProfile} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/logout").post(verifyJWT,logoutUser);
router.route("/current-user").get(verifyJWT, getProfile);
router.route("/update").patch(verifyJWT, userUpdate);

export default router