import { createContext, useState, useEffect, ReactNode } from "react";
import { authApi } from "../services/api";

type Role = "Fleet Manager" | "Dispatcher" | "Safety Officer" | "Financial Analyst";

interface User {
  email: string;
  role: Role;
  token?: string;
  provider?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: Role, remember: boolean) => Promise<boolean>;
  register: (email: string, password: string, fullName: string, role: Role) => Promise<boolean>;
  mockOAuthLogin: (provider: "google" | "microsoft") => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored =
      localStorage.getItem("transitops_user") ||
      sessionStorage.getItem("transitops_user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const register = async (
    email: string,
    password: string,
    fullName: string,
    role: Role
  ): Promise<boolean> => {
    try {
      const response = await authApi.register(email, password, fullName, role);
      if (response.data && response.data.access_token) {
        const userData: User = { email, role, token: response.data.access_token, provider: "local" };
        localStorage.setItem("transitops_user", JSON.stringify(userData));
        setUser(userData);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Register failed", error);
      return false;
    }
  };

  const login = async (
    email: string,
    password: string,
    role: Role,
    remember: boolean
  ): Promise<boolean> => {
    try {
      const response = await authApi.login(email, password, role);
      if (response.data && response.data.access_token) {
        const userData: User = { email, role, token: response.data.access_token, provider: "local" };

        if (remember) {
          localStorage.setItem("transitops_user", JSON.stringify(userData));
        } else {
          sessionStorage.setItem("transitops_user", JSON.stringify(userData));
        }

        setUser(userData);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login failed", error);
      return false;
    }
  };

  // Mock OAuth — bypasses backend entirely, sets a hardcoded session
  const mockOAuthLogin = (provider: "google" | "microsoft") => {
    const email =
      provider === "google"
        ? "admin@gmail.com"
        : "admin@outlook.com";

    const userData: User = {
      email,
      role: "Fleet Manager",
      token: "mock-oauth-token-transitops-2026",
      provider,
    };

    localStorage.setItem("transitops_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("transitops_user");
    sessionStorage.removeItem("transitops_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, mockOAuthLogin, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}
