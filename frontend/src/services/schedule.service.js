import axiosInstance from "../api/axios";

export const scheduleService = {
  createSchedule: async ({ room, scheduledAt, durationMinutes, agenda }) => {
    const res = await axiosInstance.post("/schedule/create", {
      room,
      scheduledAt,
      durationMinutes,
      agenda,
    });

    return res.data;
  },

  getUpcomingInterviews: async () => {
    const res = await axiosInstance.get("/schedule/upcoming");
    return res.data;
  },

  updateScheduleStatus: async (id, status) => {
    const res = await axiosInstance.patch(`/schedule/${id}/status`, {
      status,
    });

    return res.data;
  },

  cancelSchedule: async (id) => {
    const res = await axiosInstance.delete(`/schedule/${id}/cancel`);
    return res.data;
  },
};