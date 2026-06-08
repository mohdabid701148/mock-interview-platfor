import { createContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const socketRef = useRef(null);

    useEffect(() => {
        const SOCKET_URL =
            import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

        const cleanupSocket = () => {
            if (socketRef.current) {
                socketRef.current.removeAllListeners();
                socketRef.current.disconnect();
                socketRef.current = null;
            }

            setSocket(null);
        };

        const connectSocket = () => {
            const token = localStorage.getItem("accessToken");

            cleanupSocket();

            if (!token || token === "undefined" || token === "null") {
                return;
            }

            const socketConnection = io(SOCKET_URL, {
                withCredentials: true,
                autoConnect: false,
                reconnection: true,
                reconnectionAttempts: Infinity,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                timeout: 20000,
                forceNew: true,
                transports: ["websocket", "polling"],
                auth: {
                    token,
                },
            });

            socketRef.current = socketConnection;
            setSocket(socketConnection);

            socketConnection.on("connect", () => {
                console.log("Socket connected:", socketConnection.id);
            });

            socketConnection.on("disconnect", (reason) => {
                console.log("Socket disconnected:", reason);
            });

            socketConnection.on("connect_error", (error) => {
                console.log("Socket connection failed:", error.message);
            });

            socketConnection.connect();
        };

        connectSocket();

        window.addEventListener("auth-change", connectSocket);

        return () => {
            window.removeEventListener("auth-change", connectSocket);
            cleanupSocket();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};