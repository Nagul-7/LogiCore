import { create } from 'zustand';
const useAppStore = create((set) => ({
  trips: [],
  drivers: [],
  suppliers: [],
  kpis: { active_trips: 0, on_time_rate: 0, delayed_trips: 0, low_stock_alerts: 0, total_trips_today: 0, completed_today: 0 },
  alerts: [],
  truckPositions: {},
  inventoryLatest: [],

  setTrips: (trips) => set({ trips }),
  setDrivers: (drivers) => set({ drivers }),
  setSuppliers: (suppliers) => set({ suppliers }),
  setKPIs: (kpis) => set({ kpis }),
  addAlert: (alert) => set((state) => ({ alerts: [{ id: Date.now(), ...alert }, ...state.alerts].slice(0, 30) })),
  dismissAlert: (id) => set((state) => ({ alerts: state.alerts.filter(a => a.id !== id) })),
  updatePosition: (tripCode, pos) => set((state) => ({ truckPositions: { ...state.truckPositions, [tripCode]: pos } })),
  setInventoryLatest: (data) => set({ inventoryLatest: data }),
}));
export default useAppStore;
