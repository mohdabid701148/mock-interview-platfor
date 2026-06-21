import express from "express";

import {
  createRoom,
  joinRoom,
  leaveRoom,
  getRoomDetails,
  getUserRooms,
  startRoom,
  completeRoom,
} from "../controllers/room.controller.js"

import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  validate,
  createRoomSchema,
  joinRoomSchema,
  roomIdParamSchema,
} from "../middlewares/validation.middleware.js";

const router = express.Router();

router.post("/create", verifyJWT, validate(createRoomSchema), createRoom);

router.post("/join", verifyJWT, validate(joinRoomSchema), joinRoom);

router.post("/leave/:roomId", verifyJWT, validate(roomIdParamSchema), leaveRoom);

router.patch("/:roomId/start", verifyJWT, validate(roomIdParamSchema), startRoom);

router.patch("/:roomId/complete", verifyJWT, validate(roomIdParamSchema), completeRoom);

router.get("/my-rooms", verifyJWT, getUserRooms);

router.get("/:roomCode", verifyJWT, getRoomDetails);

export default router;