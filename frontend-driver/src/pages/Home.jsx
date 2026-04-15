import { useNavigate } from 'react-router-dom';
import { Truck, Clock, QrCode, AlertCircle, Package, RefreshCw } from 'lucide-react';
import { useActiveTrip } from '../context/ActiveTripContext';
import { useAuth }       from '../context/AuthContext';
import socket from '../lib/socket';
import { useEffect } from 'react';

const STATUS_BG = {
    en_route: '#D97706', planning: '#2563EB', assigned: '#7C3AED',
    completed: '#16A34A', delayed: '#DC2626', at_gate: '#0891B2'
};

export default function Home() {
    const { activeTrip, loading, refresh } = useActiveTrip();
    const { user, logout }  = useAuth();
    const navigate = useNavigate();

    // Live trip plan updates
    useEffect(() => {
        socket.on('trip:plan_changed', () => refresh());
        return () => socket.off('trip:plan_changed');
    }, [refresh]);

    return (
        <div style={{ padding: '20px', maxWidth: '420px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>{user?.name || 'Driver'}</h1>
                    <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '2px 0 0' }}>
                        {user?.role === 'driver' ? 'ஓட்டுனர்' : ''}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button onClick={refresh} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6B7280', padding: '4px' }}>
                        <RefreshCw size={16} />
                    </button>
                    <button onClick={logout} style={{
                        padding: '6px 14px', borderRadius: '999px', border: '1px solid #374151',
                        cursor: 'pointer', fontWeight: '600', fontSize: '12px',
                        background: 'transparent', color: '#9CA3AF'
                    }}>
                        வெளியேறு
                    </button>
                </div>
            </div>

            {/* Trip card */}
            {loading ? (
                <div style={{ background: '#1F2937', borderRadius: '12px', padding: '40px 20px', textAlign: 'center', marginBottom: '20px' }}>
                    <p style={{ color: '#6B7280', margin: 0 }}>ஏற்றுகிறது...</p>
                </div>
            ) : activeTrip ? (
                <div style={{ background: '#1F2937', borderRadius: '12px', padding: '20px', borderLeft: '4px solid #22C55E', marginBottom: '20px' }}>
                    <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '0 0 8px' }}>{activeTrip.trip_code}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <Package size={18} color="#22C55E" />
                        <span style={{ fontSize: '18px', fontWeight: '700' }}>
                            {activeTrip.material_type} · {activeTrip.quantity_kg?.toLocaleString()} kg
                        </span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '0 0 8px' }}>
                        {activeTrip.supplier_name} → {activeTrip.factory_name}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <Clock size={16} color="#9CA3AF" />
                        <span style={{ fontSize: '14px', color: '#9CA3AF' }}>
                            ETA: {activeTrip.eta ? new Date(activeTrip.eta).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'கணக்கிடுகிறது...'}
                        </span>
                        <span style={{
                            marginLeft: 'auto', padding: '2px 10px', borderRadius: '999px',
                            fontSize: '11px', fontWeight: '600', color: 'white',
                            background: STATUS_BG[activeTrip.status] || '#374151'
                        }}>
                            {activeTrip.status?.replace('_', ' ').toUpperCase()}
                        </span>
                    </div>
                    <button onClick={() => navigate('/route')} style={{
                        width: '100%', height: '48px', background: '#22C55E', color: '#111827',
                        border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '700', cursor: 'pointer'
                    }}>
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

            {/* Action buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button onClick={() => navigate('/sos')} style={{
                    height: '52px', background: '#DC2626', color: 'white', border: 'none',
                    borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}>
                    <AlertCircle size={18} /> அவசரம்
                </button>
                <button onClick={() => navigate('/qr')} disabled={!activeTrip} style={{
                    height: '52px', background: activeTrip ? '#1D4ED8' : '#374151', color: 'white', border: 'none',
                    borderRadius: '10px', fontSize: '14px', fontWeight: '700',
                    cursor: activeTrip ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}>
                    <QrCode size={18} /> QR காட்டு
                </button>
            </div>
        </div>
    );
}
