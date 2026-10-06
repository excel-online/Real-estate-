import axios, { AxiosError } from "axios";

/**
 * Single source of truth for API communication.
 * - baseURL injected at build time (VITE_API_URL)
 * - Token strategy: Authorization header (works cross-origin without cookie/CORS pain).
 *   To switch to HttpOnly cookies instead: set withCredentials: true here, remove
 *   the request interceptor, and have the server set cookies with SameSite=None; Secure.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5000/api",
  withCredentials: false,
  headers: { "Content-Type": "application/json" },
});

// ── Request: attach JWT from storage ─────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response: normalize errors + auto-logout on 401 ──────────────
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login"; // hard redirect clears stale state
    }
    // Throw a flat, predictable error shape for the UI layer
    const message = error.response?.data?.message ?? "Something went wrong. Please try again.";
    return Promise.reject(new Error(message));
  }
);
