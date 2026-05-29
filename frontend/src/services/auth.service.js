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
};