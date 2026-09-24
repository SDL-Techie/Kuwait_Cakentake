import axios from "axios";

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const fallbackDevUrl = import.meta.env.DEV ? "http://127.0.0.1:5000" : "";

export const BASE_URL = (configuredBaseUrl || fallbackDevUrl).replace(/\/+$/, "");

if (!BASE_URL) {
  throw new Error(
    "VITE_API_BASE_URL is missing. Set it to the public Flask backend URL before building the web app."
  );
}

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
});

let currentCurrency =
  (typeof window !== "undefined" ? localStorage.getItem("currency") : "") || "KWD";

export const setCurrencyHeader = (currency: string) => {
  currentCurrency = (currency || "KWD").toUpperCase();
  if (typeof window !== "undefined") {
    localStorage.setItem("currency", currentCurrency);
  }
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const currency = currentCurrency || localStorage.getItem("currency") || "KWD";

  config.headers = config.headers ?? {};

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers["X-Currency"] = currency;
  return config;
});

export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};
