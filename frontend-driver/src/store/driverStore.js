import { create } from 'zustand';
const useDriverStore = create((set) => ({
  driver: { id: 1, name: 'முருகன்', phone: '+91 98765 43201', is_online: true },
  activeTrip: null,
  currentPosition: null,
  alerts: [],
  setActiveTrip: (trip) => set({ activeTrip: trip }),
  setPosition: (pos) => set({ currentPosition: pos }),
  addAlert: (alert) => set((state) => ({ alerts: [alert, ...state.alerts] })),
}));
export default useDriverStore;
