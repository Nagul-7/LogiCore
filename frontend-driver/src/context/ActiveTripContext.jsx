import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { useAuth } from './AuthContext';

const ActiveTripContext = createContext(null);

export function ActiveTripProvider({ children }) {
    const { user } = useAuth();
    const [activeTrip, setActiveTrip] = useState(null);
    const [loading, setLoading]       = useState(true);

    const fetchActiveTrip = useCallback(async () => {
        if (!user?.driverId) { setLoading(false); return; }
        try {
            const res = await api.get(`/api/v1/trips?driver_id=${user.driverId}&active=true`);
            const trips = Array.isArray(res.data) ? res.data : [];
            // Pick the most relevant trip: en_route > assigned > planning
            const priority = ['en_route', 'assigned', 'at_gate', 'planning'];
            const sorted   = trips.sort((a, b) =>
                priority.indexOf(a.status) - priority.indexOf(b.status)
            );
            setActiveTrip(sorted[0] || null);
        } catch {
            setActiveTrip(null);
        } finally {
            setLoading(false);
        }
    }, [user?.driverId]);

    useEffect(() => {
        fetchActiveTrip();
        const interval = setInterval(fetchActiveTrip, 60_000);
        return () => clearInterval(interval);
    }, [fetchActiveTrip]);

    return (
        <ActiveTripContext.Provider value={{ activeTrip, loading, refresh: fetchActiveTrip }}>
            {children}
        </ActiveTripContext.Provider>
    );
}

export const useActiveTrip = () => useContext(ActiveTripContext);
