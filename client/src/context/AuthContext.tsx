import { createContext, useContext, ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  avatar?: string;
}

interface AuthContextValue {
  user: SafeUser | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  // Single source of truth: if a valid token exists, /auth/me resolves the user.
  // One query drives the entire app's auth state — no manual sync bugs.
  const { data: user, isLoading } = useQuery<SafeUser>({
    queryKey: ["auth", "me"],
    queryFn: async () => (await api.get("/auth/me")).data.user,
    enabled: !!localStorage.getItem("token"), // skip entirely for guests
    retry: false,                             // 401 → interceptor clears token → null user
    staleTime: 5 * 60_000,
  });

  const login = async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", data.token);
    // Seed the cache directly — instant UI update without a refetch round-trip
    queryClient.setQueryData(["auth", "me"], data.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const { data } = await api.post("/auth/register", { name, email, password });
    localStorage.setItem("token", data.token);
    queryClient.setQueryData(["auth", "me"], data.user);
  };

  const logout = async () => {
    try { await api.post("/auth/logout"); } catch { /* cookie may already be gone */ }
    localStorage.removeItem("token");
    // Wipe ALL cached data — a different user must never see stale listings/favorites
    queryClient.clear();
  };

  return (
    <AuthContext.Provider
      value={{ user: user ?? null, isLoading, isAdmin: user?.role === "admin", login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// useAuth hook — throws if used outside provider (catches wiring bugs early)
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
