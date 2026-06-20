import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { codeExecutionService } from "../services/codeExecution.service.js";

const MAX_CODE_SIZE_BYTES = 100 * 1024; // 100KB
const MAX_TEST_CASES = 10;
const ALLOWED_LANGUAGES = ["javascript", "typescript", "python", "java", "cpp"];

function validateRequest(language, code) {
  if (!language || !code) {
    throw new ApiError(400, "Language and code are required.");
  }
  if (!ALLOWED_LANGUAGES.includes(language)) {
    throw new ApiError(
      400,
      `Unsupported language. Allowed: ${ALLOWED_LANGUAGES.join(", ")}`
    );
  }
  if (Buffer.byteLength(code, "utf8") > MAX_CODE_SIZE_BYTES) {
    throw new ApiError(413, "Code payload too large. Maximum size is 50KB.");
  }
}

export const runCode = asyncHandler(async (req, res) => {
  const { language, code, stdin = "" } = req.body;

  validateRequest(language, code);

  const result = await codeExecutionService.executeCode(language, code, stdin);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Code executed successfully."));
});

export const runTestCases = asyncHandler(async (req, res) => {
  const { language, code, testCases } = req.body;

  validateRequest(language, code);

  if (!Array.isArray(testCases) || testCases.length === 0) {
    throw new ApiError(400, "At least one test case is required.");
  }
  if (testCases.length > MAX_TEST_CASES) {
    throw new ApiError(400, `Maximum ${MAX_TEST_CASES} test cases allowed.`);
  }

  const results = await codeExecutionService.executeWithTestCases(
    language,
    code,
    testCases
  );

  return res
    .status(200)
    .json(new ApiResponse(200, results, "Test cases executed successfully."));
});
