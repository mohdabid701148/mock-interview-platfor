import { createContext, useEffect, useState } from "react";
import { authService } from "../services/auth.service";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {

    try {

      const res = await authService.currentUser();

      setUser(res?.data || res);

    } catch {

      setUser(null);

    } finally {

      setLoading(false);
    }
  };

  const login = async (payload) => {

    const res = await authService.login(payload);

    const loggedInUser =
      res?.data?.user || res?.data || res;

    setUser(loggedInUser);

    return res;
  };

  const register = async (payload) => {

    const res = await authService.register(payload);

    return res;
  };

  const logout = async () => {

    await authService.logout();

    setUser(null);
  };

  useEffect(() => {

    const publicRoutes = [
      "/login",
      "/signup",
    ];

    // prevent auth loop
    if (
      publicRoutes.includes(window.location.pathname)
    ) {
      setLoading(false);
      return;
    }

    fetchCurrentUser();

  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
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