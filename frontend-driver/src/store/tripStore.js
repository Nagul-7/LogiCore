import { create } from 'zustand';
import api from '../lib/api';

const useTripStore = create((set, get) => ({
    activeTrip: null,
    tripEvents: [],
    currentETA: null,
    isOnline: true,

    fetchActiveTrip: async () => {
        try {
            const res = await api.get('/trips?status=assigned&status=en_route&status=at_gate');
            if (res.data.trips.length > 0) {
                const tripId = res.data.trips[0].id;
                const details = await api.get(`/trips/${tripId}`);
                set({ activeTrip: details.data, tripEvents: details.data.timeline, currentETA: details.data.estimated_arrival });
            } else {
                set({ activeTrip: null, tripEvents: [], currentETA: null });
            }
        } catch (e) {
            console.error(e);
        }
    },
    updateTripData: (data) => set({ activeTrip: { ...get().activeTrip, ...data } }),
    setOnline: (bool) => set({ isOnline: bool })
}));

export default useTripStore;
