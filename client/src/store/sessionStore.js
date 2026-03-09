import { create } from 'zustand';
import api from '../services/api';

export const useSessionStore = create((set) => ({
    sessions: [],
    currentSession: null,
    isLoading: false,
    error: null,

    fetchSessions: async () => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await api.get('/sessions');
            set({ sessions: data, isLoading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || 'Failed to fetch sessions', isLoading: false });
        }
    },

    getSession: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await api.get(`/boardroom/${id}`);
            set({ currentSession: data, isLoading: false });
            return data;
        } catch (error) {
            set({ error: error.response?.data?.message || 'Failed to fetch session', isLoading: false });
            throw error;
        }
    },

    createSession: async (sessionData) => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await api.post('/sessions', sessionData);
            set((state) => ({
                sessions: [data, ...state.sessions],
                isLoading: false
            }));
            return data;
        } catch (error) {
            set({ error: error.response?.data?.message || 'Failed to create session', isLoading: false });
            throw error;
        }
    },

    clearError: () => set({ error: null })
}));
