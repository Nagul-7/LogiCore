import React, { useState } from 'react';
import useStore from '../store/useStore';
import api from '../lib/api';
import { X } from 'lucide-react';

export default function TripCreator({ onClose }) {
    const { fetchDashboardData, drivers } = useStore();
    const [loading, setLoading] = useState(false);

    // Hardcoded for demo
    const formData = {
        factory_id: "c0000000-0000-0000-0000-000000000001", // Kurichi
        supplier_id: "d0000000-0000-0000-0000-000000000001", // Steel
        material_type: "Raw Steel",
        quantity_kg: 5000,
        required_by: new Date(Date.now() + 4 * 3600000).toISOString(),
        furnace_time: new Date(Date.now() + 5 * 3600000).toISOString()
    };

    const submit = async () => {
        setLoading(true);
        try {
            const temp = { ...formData };
            const res = await api.post('/trips', temp);

            // Auto assign for demo flow fast
            if (drivers.length > 0) {
                await api.post(`/trips/${res.data.id}/assign`, {
                    driver_id: drivers[0].id,
                    truck_id: "e0000000-0000-0000-0000-000000000001"
                });
            }

            fetchDashboardData();
            onClose();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'white', borderRadius: '16px', width: '500px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '24px', borderBottom: '1px solid #E2E8F0' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>Create Logistics Request</h2>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X /></button>
                </div>

                <div style={{ padding: '24px' }}>
                    <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '16px' }}>AI Engine will automatically calculate optimal route and departure buffer time.</p>

                    <button onClick={submit} disabled={loading} style={{
                        width: '100%', padding: '14px', background: 'var(--color-primary-btn)',
                        color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'
                    }}>
                        {loading ? 'Processing via AI...' : 'Generate Plan & Dispatch'}
                    </button>
                </div>
            </div>
        </div>
    );
}
