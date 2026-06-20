import { io } from "socket.io-client";

export const createSocketConnection = (token) => {
  return io(import.meta.env.VITE_SOCKET_URL, {
    withCredentials: true,
    autoConnect: false,
    auth: {
      token,
    },
  });
};