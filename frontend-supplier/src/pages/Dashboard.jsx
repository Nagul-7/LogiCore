import { useEffect, useState, useCallback } from 'react';
import { Package, Clock, CheckCircle, AlertTriangle, ChevronDown } from 'lucide-react';
import api from '../lib/api';
import socket from '../lib/socket';

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{
      position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
      padding: '14px 20px', borderRadius: '10px', fontWeight: '600', fontSize: '14px',
      background: type === 'success' ? '#DCFCE7' : '#FEF2F2',
      color: type === 'success' ? '#166534' : '#991B1B',
      border: `1px solid ${type === 'success' ? '#86EFAC' : '#FECACA'}`,
      boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
      display: 'flex', alignItems: 'center', gap: '8px',
    }}>
      {type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
      {msg}
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, color, icon: Icon }) {
  return (
    <div style={{
      background: 'white', borderRadius: '12px', padding: '20px 24px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)', borderTop: `4px solid ${color}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ margin: '0 0 6px', fontSize: '12px', color: '#64748B', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: '700', color: '#0F172A' }}>{value}</p>
        </div>
        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={20} color={color} />
        </div>
      </div>
    </div>
  );
}

// ─── Delay Form ───────────────────────────────────────────────────────────────
function DelayForm({ tripCode, onClose, onSuccess }) {
  const [delayMin, setDelayMin] = useState('30');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      await api.post('/api/v1/suppliers/1/delay', { trip_code: tripCode, delay_minutes: parseInt(delayMin), reason });
      onSuccess();
    } catch {
      onSuccess('error');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ marginTop: '12px', background: '#FEF9C3', border: '1px solid #FDE68A', borderRadius: '8px', padding: '14px' }}>
      <p style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: '600', color: '#92400E' }}>Report Delay</p>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
        {['30', '60', '120'].map(m => (
          <button key={m} onClick={() => setDelayMin(m)} style={{
            padding: '5px 14px', borderRadius: '6px', border: '1px solid',
            borderColor: delayMin === m ? '#D97706' : '#E2E8F0',
            background: delayMin === m ? '#FEF3C7' : 'white',
            color: delayMin === m ? '#92400E' : '#64748B',
            cursor: 'pointer', fontSize: '13px', fontWeight: '600',
          }}>{m === '120' ? '2hr' : m === '60' ? '1hr' : '30min'}</button>
        ))}
      </div>
      <textarea
        value={reason} onChange={e => setReason(e.target.value)}
        placeholder="Reason for delay..."
        style={{
          width: '100%', height: '64px', border: '1px solid #E2E8F0', borderRadius: '6px',
          padding: '8px 10px', fontSize: '13px', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
        }}
      />
      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
        <button onClick={submit} disabled={loading} style={{
          padding: '7px 18px', background: '#D97706', color: 'white', border: 'none',
          borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px',
        }}>{loading ? 'Sending...' : 'Submit'}</button>
        <button onClick={onClose} style={{
          padding: '7px 14px', background: 'transparent', color: '#64748B', border: '1px solid #E2E8F0',
          borderRadius: '6px', cursor: 'pointer', fontSize: '13px',
        }}>Cancel</button>
      </div>
    </div>
  );
}

// ─── Action Card ──────────────────────────────────────────────────────────────
function ActionCard({ trip, onRefresh, onToast }) {
  const [showDelay, setShowDelay] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const pickupTime = trip.pickup_window_start ? new Date(trip.pickup_window_start) : null;
  const hoursAway = pickupTime ? (pickupTime - Date.now()) / 36e5 : 99;
  const urgent = hoursAway < 2;

  const confirmReady = async () => {
    setConfirming(true);
    try {
      await api.post('/api/v1/suppliers/1/confirm', { trip_code: trip.trip_code });
      onToast('Confirmed! Driver will be notified.', 'success');
      onRefresh();
    } catch {
      onToast('Failed to confirm. Please retry.', 'error');
    } finally { setConfirming(false); }
  };

  return (
    <div style={{
      background: 'white', borderRadius: '10px', padding: '16px 20px',
      borderLeft: `4px solid ${urgent ? '#DC2626' : '#D97706'}`,
      boxShadow: '0 1px 4px rgba(0,0,0,0.07)', marginBottom: '10px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontWeight: '700', fontSize: '14px', color: '#0F172A' }}>{trip.trip_code}</span>
            {urgent && (
              <span style={{ fontSize: '10px', fontWeight: '700', color: '#DC2626', background: '#FEE2E2', padding: '2px 8px', borderRadius: '999px' }}>
                URGENT
              </span>
            )}
          </div>
          <p style={{ margin: '0 0 3px', fontSize: '13px', color: '#475569' }}>
            <strong>{trip.factory_name || 'Factory'}</strong> · {trip.material_type} · {trip.quantity_kg?.toLocaleString()} kg
          </p>
          {pickupTime && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px' }}>
              <Clock size={13} color="#64748B" />
              <span style={{ fontSize: '12px', color: '#64748B' }}>
                Pickup: {pickupTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px', flexShrink: 0, alignItems: 'flex-start' }}>
          <button onClick={confirmReady} disabled={confirming} style={{
            padding: '7px 16px', background: '#22C55E', color: 'white', border: 'none',
            borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px',
          }}>{confirming ? '...' : '✓ Confirm Ready'}</button>
          <button onClick={() => setShowDelay(v => !v)} style={{
            padding: '7px 14px', background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A',
            borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px',
            display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            Report Delay <ChevronDown size={13} />
          </button>
        </div>
      </div>

      {showDelay && (
        <DelayForm
          tripCode={trip.trip_code}
          onClose={() => setShowDelay(false)}
          onSuccess={(err) => {
            setShowDelay(false);
            onToast(err ? 'Failed to report delay.' : 'Delay reported to manager.', err ? 'error' : 'success');
            if (!err) onRefresh();
          }}
        />
      )}
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────
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

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const [trips, setTrips] = useState([]);
  const [toast, setToast] = useState(null);

  const fetchTrips = useCallback(() => {
    api.get('/api/v1/trips')
      .then(r => {
        const data = Array.isArray(r.data) ? r.data : r.data.trips || [];
        setTrips(data.filter(t => t.supplier_id === 1 || !t.supplier_id));
      })
      .catch(() => setTrips([]));
  }, []);

  useEffect(() => {
    fetchTrips();
    socket.on('trip:plan_changed', fetchTrips);
    socket.on('trip:eta_changed', fetchTrips);
    return () => {
      socket.off('trip:plan_changed', fetchTrips);
      socket.off('trip:eta_changed', fetchTrips);
    };
  }, [fetchTrips]);

  const today = new Date().toDateString();
  const pending = trips.filter(t => t.status === 'planning');
  const todayPickups = trips.filter(t => t.pickup_window_start && new Date(t.pickup_window_start).toDateString() === today);
  const completed = trips.filter(t => t.status === 'completed');

  const showToast = (msg, type) => setToast({ msg, type });

  return (
    <div>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: '700', color: '#0F172A' }}>Supplier Dashboard</h1>
        <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>Rajan Steels · Coimbatore</p>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
        <KpiCard label="Pending Confirmations" value={pending.length} color="#EF4444" icon={AlertTriangle} />
        <KpiCard label="Today's Pickups" value={todayPickups.length} color="#3B82F6" icon={Package} />
        <KpiCard label="Completed This Month" value={completed.length} color="#22C55E" icon={CheckCircle} />
      </div>

      {/* Pending Actions */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', margin: '0 0 14px' }}>
          Pending Actions
          {pending.length > 0 && (
            <span style={{ marginLeft: '8px', fontSize: '11px', background: '#EF4444', color: 'white', padding: '2px 8px', borderRadius: '999px' }}>
              {pending.length}
            </span>
          )}
        </h2>
        {pending.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '10px', padding: '32px', textAlign: 'center', color: '#94A3B8', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <CheckCircle size={32} color="#86EFAC" style={{ marginBottom: '8px' }} />
            <p style={{ margin: 0, fontWeight: '600' }}>All caught up! No pending confirmations.</p>
          </div>
        ) : (
          pending.map(t => (
            <ActionCard key={t.trip_code || t.id} trip={t} onRefresh={fetchTrips} onToast={showToast} />
          ))
        )}
      </div>

      {/* Upcoming Pickups table */}
      <div>
        <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', margin: '0 0 14px' }}>Upcoming Pickups</h2>
        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                {['Trip ID', 'Factory', 'Material', 'Quantity', 'Pickup Window', 'Status'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #E2E8F0' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trips.slice(0, 10).map((t, i) => (
                <tr key={t.trip_code || i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px 16px', fontWeight: '600', color: '#1E3A5F' }}>{t.trip_code}</td>
                  <td style={{ padding: '12px 16px', color: '#374151' }}>{t.factory_name || 'N/A'}</td>
                  <td style={{ padding: '12px 16px', color: '#374151' }}>{t.material_type}</td>
                  <td style={{ padding: '12px 16px', color: '#374151' }}>{t.quantity_kg?.toLocaleString()} kg</td>
                  <td style={{ padding: '12px 16px', color: '#374151' }}>
                    {t.pickup_window_start ? new Date(t.pickup_window_start).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                  </td>
                  <td style={{ padding: '12px 16px' }}><Badge status={t.status} /></td>
                </tr>
              ))}
              {trips.length === 0 && (
                <tr><td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#94A3B8' }}>No trips found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
