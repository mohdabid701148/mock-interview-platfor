import { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    let socketConnection = null;

    const connectSocket = () => {
      const token = localStorage.getItem("accessToken");

      if (!token || token === "undefined" || token === "null") {
        console.log("No token found for socket");
        setSocket(null);
        return;
      }

      const SOCKET_URL =
        import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

      console.log("Connecting socket to:", SOCKET_URL);

      socketConnection = io(SOCKET_URL, {
        withCredentials: true,
        auth: {
          token,
        },
      });

      setSocket(socketConnection);

      socketConnection.on("connect", () => {
        console.log("Socket connected:", socketConnection.id);
      });

      socketConnection.on("connect_error", (error) => {
        console.log("Socket connection failed:", error.message);
        console.log("Socket error details:", error);
      });
    };

    connectSocket();

    window.addEventListener("auth-change", connectSocket);

    return () => {
      window.removeEventListener("auth-change", connectSocket);

      if (socketConnection) {
        socketConnection.disconnect();
      }

      setSocket(null);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};