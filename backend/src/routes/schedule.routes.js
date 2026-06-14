import express from "express";
import {
  createSchedule,
  getUpcomingInterviews,
  updateScheduleStatus,
  cancelSchedule,
} from "../controllers/schedule.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  validate,
  createScheduleSchema,
  updateScheduleStatusSchema,
  idParamSchema,
} from "../middlewares/validation.middleware.js";

const router = express.Router();

router.use(verifyJWT);

router.post("/create", validate(createScheduleSchema), createSchedule);
router.get("/upcoming", getUpcomingInterviews);
router.patch("/:id/status", validate(updateScheduleStatusSchema), updateScheduleStatus);
router.delete("/:id/cancel", validate(idParamSchema), cancelSchedule);

export default router;