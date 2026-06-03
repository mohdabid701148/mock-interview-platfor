import axiosInstance from "../api/axios";

export const roomService = {
  createRoom: async (data) => {
    const res = await axiosInstance.post("/rooms/create", data);
    return res.data;
  },

  joinRoom: async (roomCode) => {
    const res = await axiosInstance.post("/rooms/join", { roomCode });
    return res.data;
  },

  leaveRoom: async (roomId) => {
    const res = await axiosInstance.post(`/rooms/leave/${roomId}`);
    return res.data;
  },

  getRoom: async (roomCode) => {
    const res = await axiosInstance.get(`/rooms/${roomCode}`);
    return res.data;
  },

  getMyRooms: async () => {
    const res = await axiosInstance.get("/rooms/my-rooms");
    return res.data;
  },

  startRoom: async (roomId) => {
    const res = await axiosInstance.patch(`/rooms/${roomId}/start`);
    return res.data;
  },

  completeRoom: async (roomId) => {
    const res = await axiosInstance.patch(`/rooms/${roomId}/complete`);
    return res.data;
  },
};