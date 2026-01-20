export const API_BASE = import.meta.env.VITE_API_BASE || (
  typeof window !== "undefined" && window.location.port === "8080"
    ? "http://127.0.0.1:5000"
    : ""
);
