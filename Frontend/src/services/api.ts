import axios from "axios";

export const BASE_URL = "http://127.0.0.1:5000";


export const api = axios.create({
  baseURL: BASE_URL,
});

let currentCurrency = (typeof window !== 'undefined' ? localStorage.getItem('currency') : '') || 'KWD';

export const setCurrencyHeader = (currency: string) => {
  currentCurrency = (currency || 'KWD').toUpperCase();
  if (typeof window !== 'undefined') {
    localStorage.setItem('currency', currentCurrency);
  }
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const currency = currentCurrency || localStorage.getItem('currency') || 'KWD';

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