import { create } from 'zustand';

const useStore = create((set, get) => ({
    user: { id: 'a0000002-0000-0000-0000-000000000002', name: 'Suresh', role: 'gate_guard', factory: 'Kurichi SIDCO Gate 3' },
    token: 'demo-token',
    isAuthenticated: true,
    activeTripParams: null,

    login: async () => { },
    logout: async () => { },
    setActiveTripParams: (params) => set({ activeTripParams: params })
}));

export default useStore;
