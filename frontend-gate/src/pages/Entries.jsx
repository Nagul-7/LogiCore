import { useEffect, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import api from '../lib/api';

const STATUS_STYLE = {
  planning:  { bg: '#EFF6FF', color: '#1D4ED8', label: 'Planning' },
  en_route:  { bg: '#FEF9C3', color: '#D97706', label: 'En Route' },
  at_gate:   { bg: '#F0FDF4', color: '#16A34A', label: 'At Gate' },
  completed: { bg: '#DCFCE7', color: '#166534', label: 'Completed' },
  delayed:   { bg: '#FEE2E2', color: '#DC2626', label: 'Delayed' },
};
function Badge({ status }) {
  const s = STATUS_STYLE[status] || { bg: '#F1F5F9', color: '#475569', label: status };
  return <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '700', background: s.bg, color: s.color }}>{s.label}</span>;
}

const FILTERS = ['All', 'Today', 'This Week'];

export default function Entries() {
  const [trips, setTrips] = useState([]);
  const [filter, setFilter] = useState('Today');

  useEffect(() => {
    api.get('/api/v1/trips').then(r => {
      const all = Array.isArray(r.data) ? r.data : (r.data.trips || []);
      setTrips(all.filter(t => ['completed', 'at_gate', 'en_route'].includes(t.status)));
    }).catch(() => {});
  }, []);

  const now = new Date();
  const todayStr = now.toDateString();
  const weekAgo = new Date(now - 7 * 864e5);

  const filtered = trips.filter(t => {
    const d = new Date(t.updated_at || t.created_at);
    if (filter === 'Today') return d.toDateString() === todayStr;
    if (filter === 'This Week') return d >= weekAgo;
    return true;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ClipboardList size={22} color="#1E3A5F" />
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#0F172A' }}>Gate Entry Log</h1>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>Kurichi SIDCO Gate 3</p>
          </div>
        </div>
        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '4px', background: 'white', borderRadius: '10px', padding: '4px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '7px 18px', borderRadius: '7px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
              background: filter === f ? '#1E3A5F' : 'transparent',
              color: filter === f ? 'white' : '#64748B',
              transition: 'all 0.15s',
            }}>{f}</button>
          ))}
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#F8FAFC' }}>
              {['Date', 'Time', 'Trip ID', 'Driver', 'Material', 'Quantity', 'Status'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #E2E8F0' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#94A3B8' }}>No entries found for this period.</td></tr>
            ) : (
              filtered.map((t, i) => {
                const d = new Date(t.updated_at || t.created_at);
                return (
                  <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 16px', color: '#374151' }}>{d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                    <td style={{ padding: '12px 16px', color: '#374151', fontVariantNumeric: 'tabular-nums' }}>{d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td>
                    <td style={{ padding: '12px 16px', fontWeight: '700', color: '#1E3A5F' }}>{t.trip_code}</td>
                    <td style={{ padding: '12px 16px', color: '#374151' }}>{t.driver_name || 'முருகன்'}</td>
                    <td style={{ padding: '12px 16px', color: '#374151' }}>{t.material_type}</td>
                    <td style={{ padding: '12px 16px', color: '#374151' }}>{t.quantity_kg?.toLocaleString()} kg</td>
                    <td style={{ padding: '12px 16px' }}><Badge status={t.status} /></td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        {filtered.length > 0 && (
          <div style={{ padding: '12px 16px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '12px', color: '#64748B' }}>{filtered.length} record{filtered.length !== 1 ? 's' : ''} shown</span>
          </div>
        )}
      </div>
    </div>
  );
}
