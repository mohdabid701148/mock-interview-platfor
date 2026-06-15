import axios from "axios";
import { ApiError } from "../utils/ApiError.js";

const PISTON_API_URL = "https://emkc.org/api/v2/piston";

const LANGUAGE_MAP = {
  javascript: { language: "node", version: "18.15.0" },
  typescript: { language: "typescript", version: "5.0.3" },
  python: { language: "python", version: "3.10.0" },
  java: { language: "java", version: "15.0.2" },
  cpp: { language: "c++", version: "10.2.0" },
};

export const codeExecutionService = {
  async executeCode(language, code, stdin = "") {
    const config = LANGUAGE_MAP[language];
    if (!config) {
      throw new ApiError(400, "Unsupported language");
    }

    try {
      const response = await axios.post(
        `${PISTON_API_URL}/execute`,
        {
          language: config.language,
          version: config.version,
          files: [
            {
              content: code,
            },
          ],
          stdin: stdin,
          args: [],
          compile_timeout: 10000,
          run_timeout: 5000,
          compile_memory_limit: -1,
          run_memory_limit: -1,
        },
        {
          timeout: 15000, // 15 seconds axios timeout
        }
      );

      const data = response.data;
      const compile = data.compile;
      const run = data.run;

      let type = "success";
      let output = "";

      if (compile && compile.code !== 0) {
        type = "compile_error";
        output = compile.output || compile.stderr;
      } else if (run.signal === "SIGKILL" || run.signal === "SIGTERM") {
        type = "timeout";
        output = "Execution timed out (infinite loop or took too long).";
      } else if (run.code !== 0) {
        type = "runtime_error";
        output = run.output || run.stderr;
      } else {
        type = "success";
        output = run.output || run.stdout;
      }

      return {
        type,
        output,
        executionTimeMs: type === "compile_error" ? 0 : 0 // Piston doesn't easily return ms in v2 output directly in standard fields, we just return 0 or calculate on our end. We'll leave it as 0 or we could omit it. We'll just return what we have.
      };
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        return {
          type: "timeout",
          output: "Execution timed out (service limit exceeded).",
        };
      }
      
      console.error("Piston API Error:", error?.response?.data || error.message);
      throw new ApiError(503, "Code execution service is temporarily unavailable.");
    }
  },
};
