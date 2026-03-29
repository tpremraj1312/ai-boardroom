import axios from 'axios';

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
    timeout: 120000,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
});

// Request interceptor: attach token
api.interceptors.request.use(
    (config) => {
        const stored = JSON.parse(localStorage.getItem('auth-storage') || '{}');
        const token = stored?.state?.token;
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: handle 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('auth-storage');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
