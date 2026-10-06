import { createContext, useContext, useEffect, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null); // FIX: this state was missing
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore login session when the page is refreshed
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedRefreshToken = localStorage.getItem("refreshToken");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
        setRefreshToken(savedRefreshToken || null);
      } catch (error) {
        console.error("Failed to restore authentication:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
      }
    }

    setLoading(false);
  }, []);

  // Save login information
  const login = (userData, accessToken, newRefreshToken) => {
    setUser(userData);
    setToken(accessToken);
    setRefreshToken(newRefreshToken || null);

    localStorage.setItem("token", accessToken);
    localStorage.setItem("user", JSON.stringify(userData));

    // The backend may not send a refresh token yet.
    // Never store the text "undefined" in localStorage.
    if (newRefreshToken) {
      localStorage.setItem("refreshToken", newRefreshToken);
    } else {
      localStorage.removeItem("refreshToken");
    }
  };

  // Clear login information
  const logout = async () => {
    try {
      if (refreshToken) {
        await fetch(`${API_URL}/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            refreshToken,
          }),
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setToken(null);
      setRefreshToken(null);

      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
  };

  const isAuthenticated = Boolean(token);

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}