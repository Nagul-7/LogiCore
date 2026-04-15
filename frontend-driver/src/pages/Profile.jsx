import { useEffect, useState } from 'react';
import { User, Star, Truck, Phone, CheckCircle } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
    const { user, logout } = useAuth();
    const [driver, setDriver] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.driverId) { setLoading(false); return; }
        api.get(`/api/v1/drivers/${user.driverId}`)
            .then(r => setDriver(r.data))
            .catch(() => setDriver(null))
            .finally(() => setLoading(false));
    }, [user?.driverId]);

    if (loading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <p style={{ color: '#9CA3AF' }}>ஏற்றுகிறது...</p>
            </div>
        );
    }

    const d = driver || { name: user?.name || 'Driver', phone: '—', reliability_score: '—', completed_trips: 0 };
    const initials = d.name?.split(' ').map(w => w[0]).join('').slice(0, 2) || 'D';

    return (
        <div style={{ padding: '20px', maxWidth: '420px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>சுயவிவரம் / Profile</h2>

            {/* Avatar card */}
            <div style={{ background: '#1F2937', borderRadius: '12px', padding: '24px', textAlign: 'center', marginBottom: '16px' }}>
                <div style={{ width: '72px', height: '72px', background: 'linear-gradient(135deg,#22C55E,#16A34A)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <span style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>{initials}</span>
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 4px' }}>{d.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Phone size={13} color="#9CA3AF" />
                    <p style={{ color: '#9CA3AF', margin: 0, fontSize: '14px' }}>{d.phone}</p>
                </div>
            </div>

            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div style={{ background: '#1F2937', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '6px' }}>
                        <Star size={16} color="#22C55E" />
                        <p style={{ color: '#9CA3AF', fontSize: '12px', margin: 0 }}>நம்பகத்தன்மை</p>
                    </div>
                    <p style={{ fontSize: '28px', fontWeight: '700', color: '#22C55E', margin: 0 }}>{d.reliability_score}%</p>
                </div>
                <div style={{ background: '#1F2937', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '6px' }}>
                        <CheckCircle size={16} color="#3B82F6" />
                        <p style={{ color: '#9CA3AF', fontSize: '12px', margin: 0 }}>மொத்த பணிகள்</p>
                    </div>
                    <p style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>{d.completed_trips}</p>
                </div>
            </div>

            {/* Truck info */}
            {d.plate_number && (
                <div style={{ background: '#1F2937', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Truck size={20} color="#3B82F6" />
                        <div>
                            <p style={{ fontWeight: '700', margin: '0 0 2px' }}>{d.plate_number}</p>
                            <p style={{ color: '#9CA3AF', fontSize: '13px', margin: 0 }}>{d.truck_model} · {d.capacity_kg?.toLocaleString()} kg</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Logout */}
            <button onClick={logout} style={{
                width: '100%', padding: '14px', background: 'transparent',
                border: '1px solid #374151', borderRadius: '10px',
                color: '#EF4444', cursor: 'pointer', fontWeight: '600', fontSize: '14px'
            }}>
                வெளியேறு / Logout
            </button>
        </div>
    );
}
