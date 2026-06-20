import { Router } from "express";
import { runCode, runTestCases } from "../controllers/codeExecution.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { codeExecutionLimiter } from "../middlewares/rateLimiter.middleware.js";

const router = Router();

router.use(verifyJWT);

router.post("/run", codeExecutionLimiter, runCode);
router.post("/test", codeExecutionLimiter, runTestCases);

export default router;
