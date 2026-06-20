import axios from "axios";
import { ApiError } from "../utils/ApiError.js";

const JUDGE0_URL = process.env.JUDGE0_API_URL || "https://ce.judge0.com";
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY || "";
const JUDGE0_API_HOST = process.env.JUDGE0_API_HOST || "";

// Judge0 CE language IDs
const LANGUAGE_IDS = {
  javascript: 63,  // Node.js 12.14.0
  typescript: 74,  // TypeScript 3.7.4
  python: 71,      // Python 3.8.1
  java: 62,        // Java 13.0.1
  cpp: 54,         // C++ (GCC 9.2.0)
};

const b64encode = (str) => Buffer.from(str ?? "").toString("base64");
const b64decode = (str) => (str ? Buffer.from(str, "base64").toString("utf-8") : "");

// Auto-wrap LeetCode-style code that has no entry point.
// C++/Java require a main(); Python/JS/TS do not.
function wrapCode(language, code) {
  if (language === "cpp") {
    const hasMain = /\bint\s+main\s*\(/.test(code);
    if (hasMain) return code;

    const prefix = [
      !/#include/.test(code) && "#include <bits/stdc++.h>",
      !/using\s+namespace\s+std/.test(code) && "using namespace std;",
    ].filter(Boolean).join("\n");

    return `${prefix ? prefix + "\n\n" : ""}${code}\n\nint main() {\n    return 0;\n}`;
  }

  if (language === "java") {
    const hasMain = /public\s+static\s+void\s+main/.test(code);
    if (hasMain) return code;
    // Append a Main class that the JVM can use as the entry point
    return `${code}\n\nclass Main {\n    public static void main(String[] args) {}\n}`;
  }

  return code; // python / javascript / typescript: no wrapping needed
}

function buildHeaders() {
  const headers = { "Content-Type": "application/json" };
  if (JUDGE0_API_KEY) headers["X-RapidAPI-Key"] = JUDGE0_API_KEY;
  if (JUDGE0_API_HOST) headers["X-RapidAPI-Host"] = JUDGE0_API_HOST;
  return headers;
}

function parseResult(data) {
  const statusId = data.status?.id;

  // All text fields come back base64-encoded
  const stdout = b64decode(data.stdout);
  const stderr = b64decode(data.stderr);
  const compileOutput = b64decode(data.compile_output);

  let type, output;

  if (statusId === 6) {
    type = "compile_error";
    output = compileOutput || "Compilation failed with no output.";
  } else if (statusId === 3) {
    type = "success";
    output = stdout;
  } else if (statusId === 5 || statusId === 14) {
    type = "timeout";
    output = "Execution timed out (time limit exceeded).";
  } else {
    type = "runtime_error";
    output = stderr || compileOutput || data.message || "Runtime error occurred.";
  }

  return {
    type,
    output,
    executionTimeMs: data.time ? Math.round(parseFloat(data.time) * 1000) : 0,
  };
}

async function submitToJudge0(languageId, code, stdin) {
  const response = await axios.post(
    `${JUDGE0_URL}/submissions?base64_encoded=true&wait=true`,
    {
      language_id: languageId,
      source_code: b64encode(code),
      stdin: b64encode(stdin || ""),
    },
    {
      headers: buildHeaders(),
      timeout: 30000,
    }
  );
  return response.data;
}

export const codeExecutionService = {
  async executeCode(language, code, stdin = "") {
    const languageId = LANGUAGE_IDS[language];
    if (!languageId) throw new ApiError(400, "Unsupported language");

    try {
      const data = await submitToJudge0(languageId, wrapCode(language, code), stdin);
      return parseResult(data);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      console.error("Judge0 Error:", error?.response?.data || error.message);
      throw new ApiError(503, "Code execution service temporarily unavailable.");
    }
  },

  async executeWithTestCases(language, code, testCases) {
    const languageId = LANGUAGE_IDS[language];
    if (!languageId) throw new ApiError(400, "Unsupported language");

    try {
      const wrapped = wrapCode(language, code);
      const results = await Promise.all(
        testCases.map(async (tc) => {
          const data = await submitToJudge0(languageId, wrapped, tc.input || "");
          const result = parseResult(data);
          const actualOutput = result.output.trimEnd();
          const expectedOutput =
            typeof tc.expectedOutput === "string" && tc.expectedOutput.trim() !== ""
              ? tc.expectedOutput.trimEnd()
              : null;

          return {
            ...result,
            input: tc.input || "",
            expectedOutput,
            passed: expectedOutput !== null ? actualOutput === expectedOutput : null,
          };
        })
      );
      return results;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      console.error("Judge0 Error:", error?.response?.data || error.message);
      throw new ApiError(503, "Code execution service temporarily unavailable.");
    }
  },
};
