"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import * as authLib from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import type { Address, User } from "@/types/user";

// Shape of the auth data and actions exposed to the rest of the app
interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, phone: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updates: { name: string; email: string; phone: string }) => Promise<boolean>;
  updateAddresses: (addresses: Address[]) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Tracks the logged-in user and exposes login/signup/logout/profile actions to descendants
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    // onAuthStateChange fires immediately with the current session on subscribe (event
    // "INITIAL_SESSION"), so this alone covers first load plus every later change —
    // including logins/logouts in other tabs, since the session is cookie-backed.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user?.email) {
        if (active) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }
      authLib.getCurrentUser().then((current) => {
        if (active) {
          setUser(current);
          setIsLoading(false);
        }
      });
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  // Attempts login and updates state; returns whether it succeeded
  async function login(email: string, password: string): Promise<boolean> {
    const loggedInUser = await authLib.login(email, password);
    if (!loggedInUser) return false;
    setUser(loggedInUser);
    return true;
  }

  // Creates the account and updates state; returns whether it succeeded
  async function signup(name: string, email: string, phone: string, password: string): Promise<boolean> {
    const newUser = await authLib.signup(name, email, phone, password);
    if (!newUser) return false;
    setUser(newUser);
    return true;
  }

  // Clears the session and local user state
  async function logout(): Promise<void> {
    await authLib.logout();
    setUser(null);
  }

  // Saves profile edits for the logged-in user; returns whether it succeeded
  async function updateProfile(updates: { name: string; email: string; phone: string }): Promise<boolean> {
    if (!user) return false;
    const updated = await authLib.updateUserProfile(user.id, updates);
    if (!updated) return false;
    setUser(updated);
    return true;
  }

  // Saves address-book edits for the logged-in user; returns whether it succeeded
  async function updateAddresses(addresses: Address[]): Promise<boolean> {
    if (!user) return false;
    const updated = await authLib.updateUserAddresses(user.id, addresses);
    if (!updated) return false;
    setUser(updated);
    return true;
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
