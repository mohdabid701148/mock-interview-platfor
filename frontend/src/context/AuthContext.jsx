import { useEffect, useRef, useState } from "react";
import { authService } from "../services/auth.service";
import { AuthContext } from "./auth-context";
import {
  setAccessToken,
  clearAccessToken,
  subscribeAccessToken,
  setAuthFailureHandler,
} from "../api/tokenStore";

// Backend wraps payloads in ApiResponse: { statusCode, data, message }.
// authService methods return that body (res.data), so `res.data` is the inner
// payload here.
const extractUser = (res) => res?.data?.user || res?.user || res?.data || null;

const extractAccessToken = (res) =>
  res?.data?.accessToken || res?.accessToken || null;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // Mirror of the in-memory access token, kept in React state so SocketContext
  // can reconnect whenever the token changes. The authoritative copy lives in
  // tokenStore (memory only) — never in localStorage/sessionStorage/cookies.
  const [accessToken, setAccessTokenState] = useState(null);
  const [loading, setLoading] = useState(true);
  // Ensures session restoration runs exactly once, even under React StrictMode's
  // double-invoked effects (a second concurrent refresh would fail rotation).
  const bootstrapStarted = useRef(false);

  const fetchCurrentUser = async () => {
    const res = await authService.currentUser();
    const currentUser = extractUser(res);
    setUser(currentUser || null);
    return currentUser || null;
  };

  const refreshAccessToken = async () => {
    const res = await authService.refresh();
    const token = extractAccessToken(res);
    if (!token) {
      throw new Error("No access token returned from refresh");
    }
    setAccessToken(token); // memory only
    return token;
  };

  const login = async (payload) => {
    const res = await authService.login(payload);

    const token = extractAccessToken(res);
    const loggedInUser = extractUser(res);

    if (!token) {
      throw new Error("Access token not found in backend login response");
    }

    setAccessToken(token); // memory only — refresh token is set as an HttpOnly cookie by the server

    if (loggedInUser) {
      setUser(loggedInUser);
    } else {
      await fetchCurrentUser();
    }

    return res;
  };

  const register = async (payload) => {
    return await authService.register(payload);
  };

  const logout = async () => {
    try {
      // Clears the refresh cookie and invalidates the stored refresh token.
      await authService.logout();
    } catch (err) {
      console.log("LOGOUT ERROR:", err?.response?.data || err);
    } finally {
      clearAccessToken(); // memory only
      setUser(null);
    }
  };

  useEffect(() => {
    // Mirror the in-memory token into React state (consumed by SocketContext).
    const unsubscribe = subscribeAccessToken(setAccessTokenState);

    // Invoked by the axios interceptor when a silent refresh ultimately fails.
    setAuthFailureHandler(() => {
      setUser(null);
      if (window.location.pathname !== "/login") {
        window.location.replace("/login");
      }
    });

    // Session restoration: memory is empty on every load/refresh/restart.
    // Try to mint a fresh access token from the HttpOnly refresh cookie, then
    // restore the authenticated user. If there is no valid refresh cookie, the
    // user is simply treated as logged out (no redirect — public pages render).
    const bootstrap = async () => {
      try {
        await refreshAccessToken();
        await fetchCurrentUser();
      } catch {
        clearAccessToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    if (!bootstrapStarted.current) {
      bootstrapStarted.current = true;
      bootstrap();
    }

    return () => {
      unsubscribe();
      setAuthFailureHandler(null);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loading,
        login,
        register,
        logout,
        refreshAccessToken,
        refetchUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
