import axios from 'axios';

// Single production backend (Render). No localhost in production.
const baseURL = 'https://bus-backend-wq82.onrender.com';

const api = axios.create({
  baseURL,
  withCredentials: true
});

// Attach JWT automatically (DO NOT change auth flows; just standardize usage)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

