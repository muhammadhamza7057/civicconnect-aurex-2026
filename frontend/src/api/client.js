import axios from 'axios';
import { clearAccessToken, getAccessToken, setAccessToken } from '../utils/session';

// Prefer VITE_API_URL (production), fall back to older VITE_API_BASE_URL, then localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
const RAW_BASE_URL = API_BASE_URL.replace(/\/api\/v1$/, '');

const client = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

const rawClient = axios.create({
  baseURL: RAW_BASE_URL,
  withCredentials: true
});

function normalizeError(error) {
  const response = error?.response?.data;
  return {
    message: response?.message || error.message || 'Something went wrong',
    code: response?.code || response?.error?.code || 'request_failed',
    status: error?.response?.status || 500,
    details: response?.details || response?.errors || null
  };
}

client.interceptors.request.use(config => {
  const token = getAccessToken();
  config.headers = config.headers || {};

  if (config.data instanceof FormData) {
    if (typeof config.headers.delete === 'function') {
      config.headers.delete('Content-Type');
    } else {
      delete config.headers['Content-Type'];
    }
  } else if (!config.headers['Content-Type'] && !config.headers['content-type']) {
    config.headers['Content-Type'] = 'application/json';
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise = null;

client.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config || {};
    const status = error?.response?.status;
    const requestUrl = originalRequest.url || '';

    if (
      status === 401 &&
      !originalRequest._retry &&
      !requestUrl.includes('/auth/login') &&
      !requestUrl.includes('/auth/register') &&
      !requestUrl.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = rawClient.post('/api/v1/auth/refresh', {}).then(res => res.data).finally(() => {
            refreshPromise = null;
          });
        }
        const refreshData = await refreshPromise;
        const nextToken = refreshData?.data?.accessToken || refreshData?.accessToken;
        if (nextToken) {
          setAccessToken(nextToken);
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${nextToken}`;
          return client(originalRequest);
        }
      } catch (refreshError) {
        clearAccessToken();
      }
    }

    return Promise.reject(normalizeError(error));
  }
);

export { API_BASE_URL, client, normalizeError };
