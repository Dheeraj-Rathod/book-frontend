import { useState, useEffect } from "react";
import { api, getToken, setToken, clearToken } from "../api/client.js";
import { AuthContext } from "./authContextInstance.js";

export default function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => getToken());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(getToken()));
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const currentToken = getToken();

    if (!currentToken) {
      return;
    }

    api.auth
      .me()
      .then((userData) => {
        if (isMounted) {
          setUser(userData);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setUser(null);
          setTokenState(null);
          setError(err.message);
          setLoading(false);
        }
      });

    const handleUnauthorized = () => {
      if (isMounted) {
        setUser(null);
        setTokenState(null);
        setLoading(false);
      }
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => {
      isMounted = false;
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, []);

  const login = async (userData) => {
    setError(null);
    const data = await api.auth.login(userData);
    if (data?.token) {
      setToken(data.token);
      setTokenState(data.token);
      setUser(data.user || null);
      if (!data.user) {
        const me = await api.auth.me();
        setUser(me);
      }
    }
    return data;
  };

  const register = async (userData) => {
    setError(null);
    const data = await api.auth.register(userData);
    if (data?.token) {
      setToken(data.token);
      setTokenState(data.token);
      setUser(data.user || null);
      if (!data.user) {
        const me = await api.auth.me();
        setUser(me);
      }
    }
    return data;
  };

  const logout = () => {
    clearToken();
    setTokenState(null);
    setUser(null);
    setError(null);
  };

  const refreshUser = async () => {
    try {
      setLoading(true);
      const data = await api.auth.me();
      setUser(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: Boolean(token),
    login,
    register,
    logout,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthProvider };
