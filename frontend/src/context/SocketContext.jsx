import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../hooks/useAuth";
import { SocketContext } from "./socket-context";

export const SocketProvider = ({ children }) => {
    // The access token comes from AuthContext memory — never from storage.
    // When it changes (login / silent refresh / logout) this effect re-runs,
    // so the socket reconnects with a fresh token or disconnects entirely.
    const { accessToken } = useAuth();

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

        // Tear down any previous connection before (re)connecting.
        cleanupSocket();

        // No token in memory → logged out → stay disconnected.
        if (!accessToken || accessToken === "undefined" || accessToken === "null") {
            return cleanupSocket;
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
                token: accessToken,
            },
        });

        socketRef.current = socketConnection;
        // Intentional: publish the socket instance to consumers as soon as it
        // exists (syncing an external system into React state, which is exactly
        // what effects are for here).
        // eslint-disable-next-line react-hooks/set-state-in-effect
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

        return cleanupSocket;
    }, [accessToken]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};
