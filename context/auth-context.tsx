"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import * as authLib from "@/lib/auth";
import type { User } from "@/types/user";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => boolean;
  signup: (name: string, email: string, phone: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // localStorage doesn't exist during SSR, so state must start empty on both
    // server and first client render, then update post-hydration to avoid a mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(authLib.getCurrentUser());
    setIsLoading(false);
  }, []);

  function login(email: string, password: string): boolean {
    const loggedInUser = authLib.login(email, password);
    if (!loggedInUser) return false;
    setUser(loggedInUser);
    return true;
  }

  function signup(name: string, email: string, phone: string, password: string): boolean {
    const newUser = authLib.signup(name, email, phone, password);
    if (!newUser) return false;
    setUser(newUser);
    return true;
  }

  function logout(): void {
    authLib.logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}