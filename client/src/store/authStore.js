import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            login: async (email, password) => {
                set({ isLoading: true, error: null });
                try {
                    const { data } = await api.post('/auth/login', { email, password });
                    set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
                    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
                    return data;
                } catch (error) {
                    set({ error: error.response?.data?.message || 'Login failed', isLoading: false });
                    throw error;
                }
            },

            register: async (name, email, password) => {
                set({ isLoading: true, error: null });
                try {
                    const { data } = await api.post('/auth/register', { name, email, password });
                    set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
                    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
                    return data;
                } catch (error) {
                    set({ error: error.response?.data?.message || 'Registration failed', isLoading: false });
                    throw error;
                }
            },

            logout: () => {
                set({ user: null, token: null, isAuthenticated: false });
                delete api.defaults.headers.common['Authorization'];
            },

            setToken: (token) => {
                set({ token });
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            },

            clearError: () => set({ error: null }),
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
        }
    )
);
