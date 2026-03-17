import axios from 'axios';

const envBaseURL = process.env.REACT_APP_API_BASE_URL;
const baseURL = envBaseURL ? envBaseURL.replace(/\/+$/, '') : undefined;

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  if (!baseURL) {
    throw new Error(
      'REACT_APP_API_BASE_URL is not set. Ensure .env contains it and restart the dev server (npm start).'
    );
  }

  // Attach token (if available) to every request.
  try {
    const raw = sessionStorage.getItem('auth');
    if (raw) {
      const auth = JSON.parse(raw);
      if (auth?.token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${auth.token}`;
      }
    }
  } catch {
    // Ignore session parsing errors
  }

  return config;
});

export const API_BASE_URL = baseURL;