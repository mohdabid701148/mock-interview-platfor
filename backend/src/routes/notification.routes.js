import express from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "../controllers/notification.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", verifyJWT, getNotifications);
router.patch("/read-all", verifyJWT, markAllAsRead);
router.patch("/:id/read", verifyJWT, markAsRead);

export default router;
