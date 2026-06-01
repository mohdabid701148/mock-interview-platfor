import express from "express";
import {
  createSchedule,
  getUpcomingInterviews,
  updateScheduleStatus,
  cancelSchedule,
} from "../controllers/schedule.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(verifyJWT);

router.post("/create", createSchedule);
router.get("/upcoming", getUpcomingInterviews);
router.patch("/:id/status", updateScheduleStatus);
router.delete("/:id/cancel", cancelSchedule);

export default router;