import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};

    // Skip refresh logic for logout / refresh calls
    if (originalRequest.skipAuthRefresh) {
      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/refresh-token")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => axiosInstance(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post(
          `${BASE_URL}/auth/refresh-token`,
          {},
          {
            withCredentials: true,
            skipAuthRefresh: true,
          }
        );

        processQueue();
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);

        localStorage.clear();
        sessionStorage.clear();

        window.location.replace("/login");
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;