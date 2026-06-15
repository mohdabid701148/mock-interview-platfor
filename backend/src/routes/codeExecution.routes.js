import { Router } from "express";
import { runCode } from "../controllers/codeExecution.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { codeExecutionLimiter } from "../middlewares/rateLimiter.middleware.js";

const router = Router();

router.use(verifyJWT);

router.post("/run", codeExecutionLimiter, runCode);

export default router;
