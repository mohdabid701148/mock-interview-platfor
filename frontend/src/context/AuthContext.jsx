import { createContext, useEffect, useState } from "react";
import { authService } from "../services/auth.service";

export const AuthContext = createContext();

const getAccessToken = (res) => {
  return (
    res?.data?.data?.accessToken ||
    res?.data?.accessToken ||
    res?.data?.data?.tokens?.accessToken ||
    res?.data?.tokens?.accessToken ||
    res?.accessToken
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
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [accessToken, setAccessToken] = useState(() => {
    return localStorage.getItem("accessToken");
  });

  const [loading, setLoading] = useState(true);

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
    } catch (err) {
      console.log("CURRENT USER ERROR:", err?.response?.data || err);

      setUser(null);
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  };

  const login = async (payload) => {
    try {
      const res = await authService.login(payload);

      console.log("AUTH CONTEXT LOGIN RESPONSE:", res);

      const token = getAccessToken(res);
      const loggedInUser = getUser(res);

      console.log("EXTRACTED TOKEN:", token);
      console.log("EXTRACTED USER:", loggedInUser);

      if (!token) {
        throw new Error("Access token not found in backend login response");
      }

      localStorage.setItem("accessToken", token);
      setAccessToken(token);

      if (loggedInUser) {
        localStorage.setItem("user", JSON.stringify(loggedInUser));
        setUser(loggedInUser);
      }

      window.dispatchEvent(new Event("auth-change"));

      return res;
    } catch (err) {
      console.log("AUTH CONTEXT LOGIN ERROR:", err?.response?.data || err);
      throw err;
    }
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
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      sessionStorage.clear();

      setAccessToken(null);
      setUser(null);

      window.dispatchEvent(new Event("auth-change"));
    }
  };

  useEffect(() => {
    const publicRoutes = ["/login", "/signup"];

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