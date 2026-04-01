import { create } from 'zustand';
import api from '../lib/api';

const useAuthStore = create((set) => ({
    user: { id: 'd0000001-0000-0000-0000-000000000001', name: 'முருகன்', role: 'driver', phone: '+91 98765 43210' },
    token: 'demo-token',
    isAuthenticated: true,
    login: async () => { },
    logout: () => { },
}));

export default useAuthStore;
