import express from "express";

import {
  createRoom,
  joinRoom,
  leaveRoom,
  getRoomDetails,
  getUserRooms,
} from "../controllers/Room.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/create", verifyJWT, createRoom);

router.post("/join", verifyJWT, joinRoom);

router.post("/leave/:roomId", verifyJWT, leaveRoom);

router.get("/my-rooms", verifyJWT, getUserRooms);

router.get("/:roomCode", verifyJWT, getRoomDetails);

export default router;