import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Truck, User } from 'lucide-react';
import api from '../lib/api';
import socket from '../lib/socket';

const TABS = ['All', 'Pending', 'Confirmed', 'Delayed', 'Completed'];

const STATUS_STYLE = {
  planning:  { bg: '#EFF6FF', color: '#1D4ED8', label: 'Pending' },
  confirmed: { bg: '#F0FDF4', color: '#166534', label: 'Confirmed' },
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

function ExpandedRow({ trip }) {
  return (
    <tr>
      <td colSpan={7} style={{ padding: '0' }}>
        <div style={{ background: '#F8FAFC', borderLeft: '4px solid #3B82F6', padding: '16px 24px', display: 'flex', gap: '32px' }}>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Driver</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={14} color="#3B82F6" />
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#1E293B' }}>{trip.driver_name || 'முருகன்'}</span>
            </div>
          </div>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Truck</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Truck size={14} color="#3B82F6" />
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#1E293B' }}>{trip.truck_plate || 'TRK-CBE-0042'}</span>
            </div>
          </div>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Current ETA</p>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#1E293B' }}>
              {trip.eta ? new Date(trip.eta).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }) : 'Calculating…'}
            </span>
          </div>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Destination</p>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#1E293B' }}>{trip.destination_name || 'Kurichi SIDCO'}</span>
          </div>
        </div>
      </td>
    </tr>
  );
}

export default function Pickups() {
  const [trips, setTrips] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [expanded, setExpanded] = useState(null);

  const fetchTrips = () => {
    api.get('/api/v1/trips')
      .then(r => setTrips(Array.isArray(r.data) ? r.data : r.data.trips || []))
      .catch(() => setTrips([]));
  };

  useEffect(() => {
    fetchTrips();
    socket.on('trip:plan_changed', fetchTrips);
    socket.on('trip:eta_changed', fetchTrips);
    return () => {
      socket.off('trip:plan_changed', fetchTrips);
      socket.off('trip:eta_changed', fetchTrips);
    };
  }, []);

  const filtered = trips.filter(t => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Pending') return t.status === 'planning';
    if (activeTab === 'Confirmed') return t.status === 'confirmed';
    if (activeTab === 'Delayed') return t.status === 'delayed';
    if (activeTab === 'Completed') return t.status === 'completed';
    return true;
  });

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: '700', color: '#0F172A' }}>Pickups</h1>
        <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>All scheduled material pickups</p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', background: 'white', borderRadius: '10px', padding: '6px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', width: 'fit-content' }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '7px 18px', borderRadius: '7px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
            background: activeTab === tab ? '#1E3A5F' : 'transparent',
            color: activeTab === tab ? 'white' : '#64748B',
            transition: 'all 0.15s',
          }}>{tab}</button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#F8FAFC' }}>
              {['Trip ID', 'Factory', 'Material', 'Qty (kg)', 'Pickup Window', 'Status', 'Details'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #E2E8F0' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((t, i) => (
              <>
                <tr key={t.trip_code || i} style={{ borderBottom: '1px solid #F1F5F9', cursor: 'pointer' }}
                  onClick={() => setExpanded(expanded === t.trip_code ? null : t.trip_code)}>
                  <td style={{ padding: '12px 16px', fontWeight: '700', color: '#1E3A5F' }}>{t.trip_code}</td>
                  <td style={{ padding: '12px 16px', color: '#374151' }}>{t.factory_name || '—'}</td>
                  <td style={{ padding: '12px 16px', color: '#374151' }}>{t.material_type}</td>
                  <td style={{ padding: '12px 16px', color: '#374151' }}>{t.quantity_kg?.toLocaleString()}</td>
                  <td style={{ padding: '12px 16px', color: '#374151' }}>
                    {t.pickup_window_start ? new Date(t.pickup_window_start).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                  </td>
                  <td style={{ padding: '12px 16px' }}><Badge status={t.status} /></td>
                  <td style={{ padding: '12px 16px', color: '#3B82F6', fontWeight: '600' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      View Details {expanded === t.trip_code ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </span>
                  </td>
                </tr>
                {expanded === t.trip_code && <ExpandedRow key={`exp-${t.trip_code}`} trip={t} />}
              </>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>No pickups in this category.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
