import { useEffect, useState } from 'react';
import api from '../lib/api';

const STATUS_STYLE = {
  planning:  { bg: '#EFF6FF', color: '#1D4ED8', label: 'Planning' },
  en_route:  { bg: '#FEF9C3', color: '#D97706', label: 'En Route' },
  completed: { bg: '#DCFCE7', color: '#166534', label: 'Completed' },
  delayed:   { bg: '#FEE2E2', color: '#DC2626', label: 'Delayed' },
};

function Badge({ status }) {
  const s = STATUS_STYLE[status] || { bg: '#F1F5F9', color: '#475569', label: status };
  return (
    <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '700', background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

export default function Trips() {
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    api.get('/api/v1/trips')
      .then(r => setTrips(Array.isArray(r.data) ? r.data : r.data.trips || []))
      .catch(() => setTrips([]));
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: '700', color: '#0F172A' }}>Active Trips</h1>
        <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>All trips linked to Rajan Steels (read-only)</p>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#F8FAFC' }}>
              {['Trip Code', 'Material', 'Qty (kg)', 'Origin → Dest', 'Driver', 'ETA', 'Status'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', borderBottom: '1px solid #E2E8F0' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trips.map((t, i) => (
              <tr key={t.trip_code || i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '12px 16px', fontWeight: '700', color: '#1E3A5F' }}>{t.trip_code}</td>
                <td style={{ padding: '12px 16px', color: '#374151' }}>{t.material_type}</td>
                <td style={{ padding: '12px 16px', color: '#374151' }}>{t.quantity_kg?.toLocaleString()}</td>
                <td style={{ padding: '12px 16px', color: '#374151', fontSize: '12px' }}>
                  {t.origin_name || 'Rajan Steels'} → {t.destination_name || 'Kurichi SIDCO'}
                </td>
                <td style={{ padding: '12px 16px', color: '#374151' }}>{t.driver_name || 'முருகன்'}</td>
                <td style={{ padding: '12px 16px', color: '#374151' }}>
                  {t.eta ? new Date(t.eta).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                </td>
                <td style={{ padding: '12px 16px' }}><Badge status={t.status} /></td>
              </tr>
            ))}
            {trips.length === 0 && (
              <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>No trips found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
