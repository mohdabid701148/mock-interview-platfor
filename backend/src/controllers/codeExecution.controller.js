import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { codeExecutionService } from "../services/codeExecution.service.js";

const MAX_CODE_SIZE_BYTES = 50 * 1024; // 50KB

export const runCode = asyncHandler(async (req, res) => {
  const { language, code, stdin = "" } = req.body;

  if (!language || !code) {
    throw new ApiError(400, "Language and code are required.");
  }

  // Validate language
  const allowedLanguages = ["javascript", "typescript", "python", "java", "cpp"];
  if (!allowedLanguages.includes(language)) {
    throw new ApiError(400, `Unsupported language. Allowed: ${allowedLanguages.join(", ")}`);
  }

  // Validate code size
  const codeSize = Buffer.byteLength(code, 'utf8');
  if (codeSize > MAX_CODE_SIZE_BYTES) {
    throw new ApiError(413, "Code payload too large. Maximum size is 50KB.");
  }

  const result = await codeExecutionService.executeCode(language, code, stdin);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Code executed successfully."));
});
