import { create } from 'zustand';
import api from '../lib/api';

const useStore = create((set, get) => ({
    user: { id: 'a0000001-0000-0000-0000-000000000001', name: 'Demo User', role: 'manager' },
    token: 'demo-token',
    isAuthenticated: true,

    kpis: null,
    trips: [],
    drivers: [],

    login: async () => { },
    logout: async () => { },

    fetchDashboardData: async () => {
        try {
            const [kpiRes, tripsRes, driversRes] = await Promise.all([
                api.get('/kpis'),
                api.get('/trips'),
                api.get('/drivers')
            ]);
            set({ kpis: kpiRes.data, trips: tripsRes.data.trips, drivers: driversRes.data.drivers });
        } catch (e) { console.error('Dashboard fetch error', e); }
    },

    assignTrip: async (trip_id, driver_id, truck_id) => {
        await api.post(`/trips/${trip_id}/assign`, { driver_id, truck_id });
        await get().fetchDashboardData();
    }
}));

export default useStore;
