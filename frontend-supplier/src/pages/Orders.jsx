import React, { useEffect, useState } from 'react';
import useStore from '../store/useStore';
import api from '../lib/api';
import { Package, Truck, AlertCircle, CheckCircle } from 'lucide-react';
import { io } from 'socket.io-client';

export default function Orders() {
    const { trips, fetchOrders, token } = useStore();
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [actionType, setActionType] = useState(null); // 'confirm' or 'delay'

    useEffect(() => {
        fetchOrders();
        const socket = io(import.meta.env.VITE_WS_URL || 'http://localhost:3000', { transports: ['websocket'] });
        socket.on('trip:plan_changed', fetchOrders);
        return () => socket.disconnect();
    }, [token]);

    const activeOrders = trips.filter(t => ['pending', 'assigned'].includes(t.status));

    const handleAction = async (payload) => {
        try {
            if (actionType === 'confirm') {
                await api.post(`/suppliers/${selectedTrip.id}/confirm`, { trip_id: selectedTrip.id });
            } else {
                await api.post(`/suppliers/${selectedTrip.id}/delay`, { trip_id: selectedTrip.id, ...payload });
            }
            fetchOrders();
            setSelectedTrip(null);
        } catch (e) { console.error('Action error', e); }
    };

    return (
        <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>Incoming Logistics Orders</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
                {activeOrders.length === 0 && <p style={{ color: 'var(--color-text-secondary)' }}>No pending orders.</p>}

                {activeOrders.map(t => (
                    <div key={t.id} style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-card-border)', borderRadius: '12px', padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>Trip {t.id.substring(0, 8)}</span>
                            <span style={{
                                padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                                background: t.status === 'assigned' ? 'var(--color-info-bg)' : 'var(--color-warning-bg)',
                                color: t.status === 'assigned' ? 'var(--color-info)' : 'var(--color-warning)'
                            }}>
                                {t.status.toUpperCase()}
                            </span>
                        </div>

                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>{t.material_type}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
                            <Package size={16} /> {t.expected_quantity_kg} kg
                            <Truck size={16} style={{ marginLeft: '12px' }} /> Pickup by: {new Date(t.depart_by).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => { setSelectedTrip(t); setActionType('confirm'); }}
                                style={{ flex: 1, padding: '10px', background: 'var(--color-success)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                            >
                                <CheckCircle size={16} /> Materials Ready
                            </button>
                            <button
                                onClick={() => { setSelectedTrip(t); setActionType('delay'); }}
                                style={{ flex: 1, padding: '10px', background: 'var(--color-warning-bg)', color: 'var(--color-warning)', border: '1px solid var(--color-warning)', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                            >
                                <AlertCircle size={16} /> Report Delay
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {selectedTrip && actionType === 'delay' && (
                <DelayModal onClose={() => setSelectedTrip(null)} onSubmit={handleAction} />
            )}
        </div>
    );
}

function DelayModal({ onClose, onSubmit }) {
    const [delay, setDelay] = useState(30);
    const [reason, setReason] = useState('Production delay');

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', padding: '32px', borderRadius: '12px', width: '400px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Report Delay</h3>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Delay Time (Minutes)</label>
                <select value={delay} onChange={e => setDelay(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '16px', borderRadius: '4px' }}>
                    <option value={15}>15 mins</option>
                    <option value={30}>30 mins</option>
                    <option value={60}>1 hour</option>
                    <option value={120}>2 hours</option>
                </select>

                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Reason</label>
                <input type="text" value={reason} onChange={e => setReason(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '24px', borderRadius: '4px', border: '1px solid #ccc' }} />

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={onClose} style={{ flex: 1, padding: '10px', background: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                    <button onClick={() => onSubmit({ delay_minutes: delay, reason })} style={{ flex: 1, padding: '10px', background: 'var(--color-warning)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Submit Delay</button>
                </div>
            </div>
        </div>
    );
}
