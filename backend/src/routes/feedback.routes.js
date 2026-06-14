import express from "express";
import {
  submitFeedback,
  getFeedbackForRoom,
  getMyFeedbacks,
} from "../controllers/feedback.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  validate,
  submitFeedbackSchema,
  roomIdParamSchema,
} from "../middlewares/validation.middleware.js";

const router = express.Router();

router.post("/submit", verifyJWT, validate(submitFeedbackSchema), submitFeedback);
router.get("/room/:roomId", verifyJWT, validate(roomIdParamSchema), getFeedbackForRoom);
router.get("/my-feedbacks", verifyJWT, getMyFeedbacks);

export default router;
