import { create } from 'zustand';

export const useBoardroomStore = create((set, get) => ({
    messages: [],
    phase: 'idle',          // idle | analysis | debate | cross-examination | verdict | complete
    activeAgent: null,
    isStreaming: false,
    verdict: null,
    dashboardData: null,
    streamBuffer: {},       // { agentRole: partialText }
    error: null,

    setMessages: (messages) => set({ messages }),

    addMessage: (message) => set((state) => ({
        messages: [...state.messages, message],
        streamBuffer: { ...state.streamBuffer, [message.agentRole]: '' }
    })),

    appendChunk: (agentRole, chunk) => set((state) => ({
        streamBuffer: {
            ...state.streamBuffer,
            [agentRole]: (state.streamBuffer[agentRole] || '') + chunk
        }
    })),

    setActiveAgent: (agentRole) => set({ activeAgent: agentRole, isStreaming: !!agentRole }),
    setPhase: (phase) => set({ phase }),
    setVerdict: (verdict) => set({ verdict }),
    setDashboardData: (dashboardData) => set({ dashboardData }),
    setError: (error) => set({ error }),

    reset: () => set({
        messages: [], phase: 'idle', activeAgent: null,
        isStreaming: false, verdict: null, dashboardData: null,
        streamBuffer: {}, error: null
    }),
}));
