import { useEffect, useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Clock, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useActiveTrip } from '../context/ActiveTripContext';

export default function QRDisplay() {
    const { activeTrip } = useActiveTrip();
    const [token, setToken]         = useState(null);
    const [expiresAt, setExpiresAt] = useState(null);
    const [timeLeft, setTimeLeft]   = useState('');
    const [fetching, setFetching]   = useState(false);
    const refreshTimer = useRef(null);
    const navigate = useNavigate();

    const fetchQR = async () => {
        if (!activeTrip?.trip_code) return;
        setFetching(true);
        try {
            const r = await api.post('/api/v1/qr/generate', { trip_code: activeTrip.trip_code });
            setToken(r.data.token);
            setExpiresAt(new Date(r.data.expires_at));
        } catch (err) {
            console.error('QR generation failed:', err);
        } finally {
            setFetching(false);
        }
    };

    // Initial fetch + auto-refresh 30s before expiry (token lasts 5min → refresh every ~4min)
    useEffect(() => {
        fetchQR();
        refreshTimer.current = setInterval(fetchQR, 4 * 60 * 1000);
        return () => clearInterval(refreshTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTrip?.trip_code]);

    // Countdown timer
    useEffect(() => {
        if (!expiresAt) return;
        const t = setInterval(() => {
            const diff = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
            const m = Math.floor(diff / 60);
            const s = diff % 60;
            setTimeLeft(`${m}:${String(s).padStart(2, '0')}`);
            if (diff === 0) fetchQR(); // auto-refresh on expire
        }, 1000);
        return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [expiresAt]);

    if (!activeTrip) {
        return (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <p style={{ color: '#9CA3AF' }}>செயலில் உள்ள பயணம் இல்லை</p>
                <p style={{ color: '#6B7280', fontSize: '13px' }}>No active trip — QR unavailable</p>
                <button onClick={() => navigate('/home')} style={{ marginTop: '16px', background: '#22C55E', color: '#111827', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>
                    முகப்பு / Home
                </button>
            </div>
        );
    }

    const qrValue = token
        ? JSON.stringify({ token, trip_code: activeTrip.trip_code, driver_id: activeTrip.driver_id })
        : '';
    const isExpiringSoon = timeLeft && parseInt(timeLeft.split(':')[0]) === 0 && parseInt(timeLeft.split(':')[1]) < 60;

    return (
        <div style={{ padding: '20px', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Header */}
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
                <button onClick={() => navigate('/home')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'white', padding: '8px' }}>
                    <ArrowLeft size={24} />
                </button>
                <h2 style={{ margin: '0 auto', fontSize: '18px', fontWeight: '600' }}>நுழைவு QR குறியீடு</h2>
                <button onClick={fetchQR} disabled={fetching} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '8px' }}>
                    <RefreshCw size={18} style={{ animation: fetching ? 'spin 1s linear infinite' : 'none' }} />
                </button>
            </div>

            {/* QR Code */}
            <div style={{ background: 'white', padding: '24px', borderRadius: '16px', marginBottom: '24px', boxShadow: isExpiringSoon ? '0 0 24px rgba(220,38,38,0.4)' : '0 0 24px rgba(34,197,94,0.2)' }}>
                {token ? (
                    <QRCodeSVG value={qrValue} size={220} bgColor="white" fgColor="#111827" />
                ) : (
                    <div style={{ width: '220px', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>
                        உருவாக்குகிறது...
                    </div>
                )}
            </div>

            {/* Trip info */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>{activeTrip.trip_code}</p>
                <p style={{ color: '#9CA3AF', fontSize: '14px', margin: '0 0 4px' }}>
                    {activeTrip.driver_name} · {activeTrip.truck || 'Truck'}
                </p>
                <p style={{ color: '#9CA3AF', fontSize: '14px', margin: 0 }}>
                    {activeTrip.material_type} · {activeTrip.quantity_kg?.toLocaleString()} kg
                </p>
            </div>

            {/* Timer */}
            {timeLeft && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <Clock size={16} color={isExpiringSoon ? '#DC2626' : '#9CA3AF'} />
                    <span style={{ color: isExpiringSoon ? '#DC2626' : '#9CA3AF', fontSize: '14px', fontWeight: isExpiringSoon ? '700' : '400' }}>
                        {isExpiringSoon ? '⚠ ' : ''}காலாவதியாகும்: {timeLeft}
                    </span>
                </div>
            )}

            <p style={{ color: '#9CA3AF', fontSize: '14px', textAlign: 'center' }}>
                காவலரிடம் காட்டுங்கள்<br />
                <span style={{ fontSize: '12px' }}>Show this to the gate guard</span>
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
