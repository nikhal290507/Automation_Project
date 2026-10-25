import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:4000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("autoflow_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("autoflow_token");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export function apiErrorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: string; details?: Array<{ message: string }> } | undefined;
    if (data?.details?.length) return data.details[0].message;
    const debug = (data as { debug?: string } | undefined)?.debug;
    if (debug?.includes("Can't reach database server")) {
      return "The database is unavailable. Start PostgreSQL on localhost:5432, then try again.";
    }
    if (data?.error) return data.error;
    if (!err.response) return "Can't reach the AutoFlow API. Start the backend server, then try again.";
  }
  return fallback;
}
