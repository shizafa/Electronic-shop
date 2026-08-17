"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import * as authLib from "@/lib/auth";
import type { Address, User } from "@/types/user";

// Shape of the auth data and actions exposed to the rest of the app
interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => boolean;
  signup: (name: string, email: string, phone: string, password: string) => boolean;
  logout: () => void;
  updateProfile: (updates: { name: string; email: string; phone: string }) => void;
  updateAddresses: (addresses: Address[]) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Tracks the logged-in user and exposes login/signup/logout/profile actions to descendants
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

  // Attempts login and updates state; returns whether it succeeded
  function login(email: string, password: string): boolean {
    const loggedInUser = authLib.login(email, password);
    if (!loggedInUser) return false;
    setUser(loggedInUser);
    return true;
  }

  // Creates the account and updates state; returns whether it succeeded
  function signup(name: string, email: string, phone: string, password: string): boolean {
    const newUser = authLib.signup(name, email, phone, password);
    if (!newUser) return false;
    setUser(newUser);
    return true;
  }

  // Clears the session and local user state
  function logout(): void {
    authLib.logout();
    setUser(null);
  }

  // Saves profile edits for the logged-in user
  function updateProfile(updates: { name: string; email: string; phone: string }): void {
    if (!user) return;
    const updated = authLib.updateUserProfile(user.id, updates);
    if (updated) setUser(updated);
  }

  // Saves address-book edits for the logged-in user
  function updateAddresses(addresses: Address[]): void {
    if (!user) return;
    const updated = authLib.updateUserAddresses(user.id, addresses);
    if (updated) setUser(updated);
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, signup, logout, updateProfile, updateAddresses }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook to access auth state/actions from any component inside AuthProvider
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}