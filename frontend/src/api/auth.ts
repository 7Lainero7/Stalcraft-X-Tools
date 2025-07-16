import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Перенаправляем на логин при 401 ошибке
      window.location.href = '/login?from=' + encodeURIComponent(window.location.pathname);
    }
    return Promise.reject(error);
  }
);