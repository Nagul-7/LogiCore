import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Clock, QrCode, AlertCircle, Package } from 'lucide-react';
import api from '../lib/api';
import socket from '../lib/socket';

export default function Home() {
  const [trip, setTrip] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/v1/trips/TRIP-2026-001')
      .then(r => setTrip(r.data))
      .catch(err => console.error('Trip fetch error:', err));

    socket.on('trip:plan_changed', (data) => {
      setTrip(prev => prev ? { ...prev, quantity_kg: data.new_quantity } : prev);
    });

    return () => socket.off('trip:plan_changed');
  }, []);

  const statusColor = { en_route: '#D97706', planning: '#2563EB', completed: '#16A34A', delayed: '#DC2626' };

  return (
    <div style={{ padding: '20px', maxWidth: '420px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>முருகன்</h1>
          <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '2px 0 0' }}>+91 98765 43201</p>
        </div>
        <button onClick={() => setIsOnline(!isOnline)} style={{
          padding: '6px 16px', borderRadius: '999px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '13px',
          background: isOnline ? '#22C55E' : '#374151', color: isOnline ? '#111827' : '#9CA3AF'
        }}>
          {isOnline ? 'Online' : 'Offline'}
        </button>
      </div>

      {trip ? (
        <div style={{ background: '#1F2937', borderRadius: '12px', padding: '20px', borderLeft: '4px solid #22C55E', marginBottom: '20px' }}>
          <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '0 0 8px' }}>{trip.trip_code}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Package size={18} color="#22C55E" />
            <span style={{ fontSize: '18px', fontWeight: '700' }}>{trip.material_type} · {trip.quantity_kg} kg</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Clock size={16} color="#9CA3AF" />
            <span style={{ fontSize: '14px', color: '#9CA3AF' }}>ETA: {trip.eta ? new Date(trip.eta).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'Calculating...'}</span>
            <span style={{ marginLeft: 'auto', padding: '2px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '600', background: '#FEF9C3', color: '#D97706' }}>
              {trip.status?.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <button onClick={() => navigate('/route')} style={{ width: '100%', height: '48px', background: '#22C55E', color: '#111827', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '700', cursor: 'pointer' }}>
            வரைபடம் பார் / View Map
          </button>
        </div>
      ) : (
        <div style={{ background: '#1F2937', borderRadius: '12px', padding: '40px 20px', textAlign: 'center', marginBottom: '20px' }}>
          <Truck size={40} color="#374151" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: '#6B7280', margin: 0 }}>செயலில் உள்ள பணி இல்லை</p>
          <p style={{ color: '#4B5563', fontSize: '12px', margin: '4px 0 0' }}>No active trip assigned</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <button onClick={() => navigate('/sos')} style={{ height: '52px', background: '#DC2626', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <AlertCircle size={18} /> அவசரம்
        </button>
        <button onClick={() => navigate('/qr')} style={{ height: '52px', background: '#1D4ED8', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <QrCode size={18} /> QR காட்டு
        </button>
      </div>
    </div>
  );
}
