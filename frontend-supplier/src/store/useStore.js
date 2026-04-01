import { create } from 'zustand';
import api from '../lib/api';

const useStore = create((set, get) => ({
    user: { id: 'c0000001-0000-0000-0000-000000000001', name: 'Rajan Metals', role: 'supplier' },
    token: 'demo-token',
    isAuthenticated: true,
    trips: [],

    login: async () => { },
    logout: async () => { },
    fetchOrders: async () => {
        try {
            const res = await api.get('/trips');
            set({ trips: res.data.trips });
        } catch (e) { }
    }
}));

export default useStore;
