import axiosInstance from "../api/axios";

export const feedbackService = {
  submitFeedback: async (data) => {
    const res = await axiosInstance.post("/feedback/submit", data);
    return res.data;
  },

  getFeedbackForRoom: async (roomId) => {
    const res = await axiosInstance.get(`/feedback/room/${roomId}`);
    return res.data;
  },

  getMyFeedbacks: async () => {
    const res = await axiosInstance.get("/feedback/my-feedbacks");
    return res.data;
  },
};
