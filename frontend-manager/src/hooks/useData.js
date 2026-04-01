import { useEffect } from 'react';
import api from '../lib/api';
import socket from '../lib/socket';
import useAppStore from '../store/useAppStore';

export default function useData() {
  const { setTrips, setDrivers, setSuppliers, setKPIs, addAlert, updatePosition, setInventoryLatest } = useAppStore();

  async function loadAll() {
    try {
      const [tripsRes, driversRes, suppliersRes, kpisRes, inventoryRes] = await Promise.all([
        api.get('/api/v1/trips'),
        api.get('/api/v1/drivers'),
        api.get('/api/v1/suppliers'),
        api.get('/api/v1/kpis'),
        api.get('/api/v1/kpis/inventory/latest')
      ]);
      setTrips(tripsRes.data);
      setDrivers(driversRes.data);
      setSuppliers(suppliersRes.data);
      setKPIs(kpisRes.data);
      setInventoryLatest(inventoryRes.data);
    } catch (err) {
      console.error('Data load failed:', err.message);
    }
  }

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, 30000);

    socket.on('trip:gps_update', (data) => {
      updatePosition(data.trip_code, { lat: data.lat, lng: data.lng, speed: data.speed_kmh, time: data.timestamp });
    });
    socket.on('trip:exception', (data) => {
      addAlert({ type: 'exception', message: `Driver no-show detected \u2014 ${data.trip_code}`, severity: 'critical' });
    });
    socket.on('inventory:alert', (data) => {
      addAlert({ type: 'inventory', message: `Low stock \u2014 ${data.material_type} at ${data.fill_percent}%`, severity: 'warning' });
    });
    socket.on('trip:plan_changed', () => loadAll());
    socket.on('trip:epod_confirmed', () => loadAll());

    return () => {
      clearInterval(interval);
      ['trip:gps_update','trip:exception','inventory:alert','trip:plan_changed','trip:epod_confirmed']
        .forEach(e => socket.off(e));
    };
  }, []);
}
