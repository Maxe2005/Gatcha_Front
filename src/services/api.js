import axios from "axios";

// Create flexible instances that can work with proxy in dev
// In production/docker, we might need a different strategy (e.g. nginx routing)
// For now, we assume the proxy in vite.config.js handles routing to localhost ports
// or in docker we configure the proxy to point to service names if we were using a node server.
// But valid client-side code runs in browser, so "service names" don't resolve.
// The browser needs to hit localhost (if exposed) or the same origin (if served/proxied).
// We will use the relative paths matching the proxy.

export const authApi = axios.create({
  baseURL: "/auth-service",
  headers: {
    "Content-Type": "application/json",
  },
});

export const invocationApi = axios.create({
  baseURL: "/invocation-service",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token interceptor
const addToken = (config) => {
  const match = document.cookie.match(new RegExp("(^| )token=([^;]+)"));
  const token = match ? match[2] : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // Assuming Bearer token
  }
  return config;
};

authApi.interceptors.request.use(addToken);
invocationApi.interceptors.request.use(addToken);
