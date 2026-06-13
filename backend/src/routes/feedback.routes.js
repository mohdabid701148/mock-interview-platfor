import express from "express";
import {
  submitFeedback,
  getFeedbackForRoom,
  getMyFeedbacks,
} from "../controllers/feedback.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/submit", verifyJWT, submitFeedback);
router.get("/room/:roomId", verifyJWT, getFeedbackForRoom);
router.get("/my-feedbacks", verifyJWT, getMyFeedbacks);

export default router;
