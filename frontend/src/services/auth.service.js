import axiosInstance from "../api/axios";

export const authService = {
  login: async (data) => {
    const res = await axiosInstance.post(
      "/auth/login",
      data
    );

    return res.data;
  },

  register: async (data) => {
    const res = await axiosInstance.post(
      "/auth/register",
      data
    );

    return res.data;
  },

  logout: async () => {
    const res = await axiosInstance.post(
      "/auth/logout",
      {},
      {
        skipAuthRefresh: true,
      }
    );

    return res.data;
  },

  currentUser: async () => {
    const res = await axiosInstance.get(
      "/auth/current-user"
    );

    return res.data;
  },

  updateProfile: async (data) => {
    const res = await axiosInstance.patch(
      "/auth/update",
      data
    );

    return res.data;
  },

  verifyEmail: async (token) => {
    // Public endpoint — skip the 401/403 refresh-and-redirect interceptor.
    const res = await axiosInstance.get(
      `/auth/verify-email/${token}`,
      { skipAuthRefresh: true }
    );

    return res.data;
  },

  resendVerification: async (email) => {
    const res = await axiosInstance.post(
      "/auth/resend-verification",
      { email },
      { skipAuthRefresh: true }
    );

    return res.data;
  },
};