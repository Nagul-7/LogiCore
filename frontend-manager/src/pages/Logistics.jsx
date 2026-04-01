import React, { useEffect, useState } from 'react';
import useStore from '../store/useStore';
import { AlertCircle, Clock, Truck, ShieldAlert } from 'lucide-react';
import { io } from 'socket.io-client';

export default function Logistics() {
    const { trips, fetchDashboardData, token } = useStore();
    const [events, setEvents] = useState([]);

    useEffect(() => {
        fetchDashboardData();

        const socket = io(import.meta.env.VITE_WS_URL || 'http://localhost:3000', {
            transports: ['websocket']
        });

        socket.on('trip:exception', (data) => {
            setEvents(prev => [{ ...data, timestamp: new Date() }, ...prev]);
            fetchDashboardData();
        });

        socket.on('trip:gps_update', () => { fetchDashboardData(); });

        return () => { socket.disconnect(); };
    }, [token]);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>Live Logistics</h1>
                    <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>3-way coordination & SOS alerts</p>
                </div>
            </div>

            {events.length > 0 && (
                <div style={{ background: 'var(--color-danger-bg)', border: '1px solid var(--color-danger)', borderRadius: '12px', padding: '16px', marginBottom: '32px' }}>
                    <h2 style={{ color: 'var(--color-danger)', fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <ShieldAlert size={20} /> ALERTS / EXCEPTIONS
                    </h2>
                    {events.map((e, idx) => (
                        <div key={idx} style={{ padding: '8px 0', borderBottom: idx === events.length - 1 ? 'none' : '1px solid rgba(220,38,38,0.2)', color: 'var(--color-text-primary)' }}>
                            <strong>{e.type.toUpperCase()}:</strong> {e.details} (Trip: {e.trip_id})
                        </div>
                    ))}
                </div>
            )}

            <div style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-card-border)', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: 'var(--color-table-header-bg)', color: 'var(--color-text-secondary)', fontSize: '12px', textTransform: 'uppercase' }}>
                        <tr>
                            <th style={{ padding: '16px 24px', fontWeight: 'bold' }}>Trip ID</th>
                            <th style={{ padding: '16px 24px', fontWeight: 'bold' }}>Driver / Truck</th>
                            <th style={{ padding: '16px 24px', fontWeight: 'bold' }}>Supplier → Destination</th>
                            <th style={{ padding: '16px 24px', fontWeight: 'bold' }}>Material (kG)</th>
                            <th style={{ padding: '16px 24px', fontWeight: 'bold' }}>Status</th>
                            <th style={{ padding: '16px 24px', fontWeight: 'bold' }}>Timing</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trips.length === 0 && (
                            <tr>
                                <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>No active trips found.</td>
                            </tr>
                        )}
                        {trips.map(t => (
                            <tr key={t.id} style={{ borderBottom: '1px solid var(--color-table-border)', ':hover': { background: 'var(--color-table-hover)' } }}>
                                <td style={{ padding: '16px 24px', fontSize: '14px', fontFamily: 'monospace' }}>{t.id.substring(0, 8)}</td>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Truck size={16} color="var(--color-text-secondary)" />
                                        <div>
                                            <p style={{ fontSize: '14px', fontWeight: '600' }}>{t.driver_name || 'Unassigned'}</p>
                                            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{t.truck_registration}</p>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <p style={{ fontSize: '14px', fontWeight: '500' }}>{t.supplier_name}</p>
                                    <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>→ {t.factory_name}</p>
                                </td>
                                <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '600' }}>{t.expected_quantity_kg}kg <br /><span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{t.material_type}</span></td>
                                <td style={{ padding: '16px 24px' }}>
                                    <span style={{
                                        padding: '4px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase',
                                        background: t.status === 'en_route' ? 'var(--color-info-bg)' : t.status === 'delayed' ? 'var(--color-danger-bg)' : 'var(--color-muted-bg)',
                                        color: t.status === 'en_route' ? 'var(--color-info)' : t.status === 'delayed' ? 'var(--color-danger)' : 'var(--color-muted)'
                                    }}>
                                        {t.status.replace('_', ' ')}
                                    </span>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Clock size={16} color={new Date(t.estimated_arrival).getTime() < Date.now() ? 'var(--color-danger)' : 'var(--color-text-secondary)'} />
                                        <div style={{ fontSize: '13px' }}>
                                            <p style={{ color: 'var(--color-text-secondary)' }}>Dep: {new Date(t.depart_by).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            <p style={{ fontWeight: '600', color: new Date(t.estimated_arrival).getTime() < Date.now() ? 'var(--color-danger)' : 'var(--color-text-primary)' }}>
                                                ETA: {new Date(t.estimated_arrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
