import { createContext, useEffect, useState } from "react";
import { authService } from "../services/auth.service";

export const AuthContext = createContext();

const safeParseUser = () => {
  try {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

const getAccessToken = (res) => {
  return (
    res?.data?.data?.accessToken ||
    res?.data?.accessToken ||
    res?.data?.data?.tokens?.accessToken ||
    res?.data?.tokens?.accessToken ||
    res?.accessToken ||
    null
  );
};

const getRefreshToken = (res) => {
  return (
    res?.data?.data?.refreshToken ||
    res?.data?.refreshToken ||
    res?.data?.data?.tokens?.refreshToken ||
    res?.data?.tokens?.refreshToken ||
    res?.refreshToken ||
    null
  );
};

const getUser = (res) => {
  return (
    res?.data?.data?.user ||
    res?.data?.user ||
    res?.data?.data?.userData ||
    res?.data?.userData ||
    res?.user ||
    null
  );
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(safeParseUser);
  const [accessToken, setAccessToken] = useState(() => {
    return localStorage.getItem("accessToken");
  });
  const [loading, setLoading] = useState(true);

  const clearAuthStorage = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    sessionStorage.clear();
    setAccessToken(null);
    setUser(null);
    window.dispatchEvent(new Event("auth-change"));
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await authService.currentUser();

      const currentUser =
        res?.data?.data?.user ||
        res?.data?.user ||
        res?.data?.data ||
        res?.data ||
        res;

      setUser(currentUser);

      if (currentUser) {
        localStorage.setItem("user", JSON.stringify(currentUser));
      }

      return currentUser;
    } catch (err) {
      const status = err?.response?.status;

      if (status === 401 || status === 403) {
        // Genuine auth failure — clear everything
        clearAuthStorage();
        return null;
      }

      // For 429 (rate limited) or network errors, keep cached user
      // The user IS authenticated, just temporarily blocked
      const cachedUser = safeParseUser();
      if (cachedUser) {
        setUser(cachedUser);
        return cachedUser;
      }

      // No cached user and can't verify — treat as unauthenticated
      setUser(null);
      localStorage.removeItem("user");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const login = async (payload) => {
    const res = await authService.login(payload);

    const token = getAccessToken(res);
    const refreshToken = getRefreshToken(res);
    const loggedInUser = getUser(res);

    if (!token) {
      throw new Error("Access token not found in backend login response");
    }

    localStorage.setItem("accessToken", token);
    setAccessToken(token);

    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }

    if (loggedInUser) {
      localStorage.setItem("user", JSON.stringify(loggedInUser));
      setUser(loggedInUser);
    } else {
      await fetchCurrentUser();
    }

    window.dispatchEvent(new Event("auth-change"));

    return res;
  };

  const register = async (payload) => {
    return await authService.register(payload);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.log("LOGOUT ERROR:", err?.response?.data || err);
    } finally {
      clearAuthStorage();
    }
  };

  useEffect(() => {
    // Public pages must render instantly without waiting on /current-user
    // (which would otherwise block the landing page during a Render cold start).
    const publicRoutes = ["/", "/login", "/signup", "/verify-email"];

    if (publicRoutes.includes(window.location.pathname)) {
      setLoading(false);
      return;
    }

    fetchCurrentUser();
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
        refetchUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};