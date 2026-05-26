import axiosInstance from "../api/axios";

export const authService = {
  register: (data) => axiosInstance.post("/auth/register", data),
  login: (data) => axiosInstance.post("/auth/login", data),
  logout: () => axiosInstance.post("/auth/logout"),
  getCurrentUser: () => axiosInstance.get("/auth/current-user"),
  refreshToken: () => axiosInstance.post("/auth/refresh-token"),
};