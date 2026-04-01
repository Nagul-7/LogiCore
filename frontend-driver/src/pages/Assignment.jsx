import React, { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import api from '../lib/api';

export default function Assignment({ assignment, onAccept, onDecline }) {
    const [timeLeft, setTimeLeft] = useState(20);

    useEffect(() => {
        if (!assignment) return;
        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    onDecline(); // Auto decline
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [assignment, onDecline]);

    if (!assignment) return null;

    const handleAccept = async () => {
        try {
            await api.post(`/trips/${assignment.id}/depart`);
            onAccept();
        } catch (e) { console.error('Accept error', e); }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(17, 24, 39, 0.9)', zIndex: 1000,
            display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '24px'
        }}>
            <div style={{ background: 'var(--color-card-bg)', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '400px' }}>
                <h2 style={{ color: 'white', fontSize: '20px', fontWeight: '700', textAlign: 'center', marginBottom: '24px' }}>புதிய பணி!</h2>

                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                    <MapPin color="var(--color-primary-btn)" size={24} />
                    <div>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>Pick up</p>
                        <p style={{ color: 'white', fontWeight: 'bold' }}>{assignment.supplier_name || 'Supplier'}</p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                    <MapPin color="#2563EB" size={24} />
                    <div>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>Drop off</p>
                        <p style={{ color: 'white', fontWeight: 'bold' }}>{assignment.factory_name || 'Factory'}</p>
                    </div>
                </div>

                <div style={{ background: '#111827', padding: '16px', borderRadius: '8px', marginBottom: '24px', textAlign: 'center' }}>
                    <p style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>{assignment.material_type} - {assignment.expected_quantity_kg}kg</p>
                    <p style={{ color: 'var(--color-warning)', marginTop: '8px', fontSize: '14px' }}>Depart by {new Date(assignment.depart_by).toLocaleTimeString()}</p>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '50%', border: '4px solid var(--color-primary-btn)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto',
                        color: 'white', fontSize: '20px', fontWeight: 'bold'
                    }}>
                        {timeLeft}
                    </div>
                </div>

                <button onClick={handleAccept} style={{
                    width: '100%', background: 'var(--color-primary-btn)', color: 'var(--color-btn-text)',
                    height: '52px', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', marginBottom: '16px'
                }}>
                    ஏற்றுக்கொள் / Accept
                </button>
                <button onClick={onDecline} style={{
                    width: '100%', background: 'transparent', color: 'var(--color-text-secondary)',
                    border: 'none', fontWeight: '500', padding: '8px'
                }}>
                    நிராகரி / Decline
                </button>
            </div>
        </div>
    );
}
