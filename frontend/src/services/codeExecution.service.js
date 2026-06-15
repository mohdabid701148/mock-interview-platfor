import axiosInstance from "../api/axios";

export const codeExecutionService = {
  runCode: async (language, code, stdin = "") => {
    const res = await axiosInstance.post("/code/run", { language, code, stdin });
    return res.data;
  },
};
