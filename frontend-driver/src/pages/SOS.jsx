import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, MapPin } from 'lucide-react';
import api from '../lib/api';
import { useActiveTrip } from '../context/ActiveTripContext';

const reasons = [
    { value: 'breakdown',   label: 'வாகன பழுது',       sublabel: 'Vehicle Breakdown' },
    { value: 'accident',    label: 'விபத்து',           sublabel: 'Accident' },
    { value: 'wrong_route', label: 'வழி தெரியவில்லை', sublabel: 'Wrong Route' },
    { value: 'robbery',     label: 'திருட்டு / தாக்குதல்', sublabel: 'Robbery / Assault' },
    { value: 'other',       label: 'மற்றவை',           sublabel: 'Other' },
];

export default function SOS() {
    const [selected, setSelected]   = useState('');
    const [sent, setSent]           = useState(false);
    const [sending, setSending]     = useState(false);
    const [locating, setLocating]   = useState(false);
    const [gpsStatus, setGpsStatus] = useState('idle'); // idle | locating | got | failed
    const [coords, setCoords]       = useState({ lat: null, lng: null });
    const navigate   = useNavigate();
    const { activeTrip } = useActiveTrip();

    const locateAndSend = () => {
        setLocating(true);
        setGpsStatus('locating');
        navigator.geolocation?.getCurrentPosition(
            pos => {
                setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                setGpsStatus('got');
                setLocating(false);
            },
            () => { setGpsStatus('failed'); setLocating(false); },
            { timeout: 8000 }
        ) ?? setGpsStatus('failed');
    };

    const sendSOS = async () => {
        if (!selected) return;
        setSending(true);
        try {
            const tripCode = activeTrip?.trip_code;
            if (!tripCode) throw new Error('No active trip');
            await api.post(`/api/v1/trips/${tripCode}/sos`, {
                reason: selected,
                lat: coords.lat ?? 0,
                lng: coords.lng ?? 0,
            });
            setSent(true);
        } catch (err) {
            console.error('SOS failed:', err);
            alert('SOS அனுப்ப தவறு ஏற்பட்டது / SOS send failed. Please call directly.');
        } finally {
            setSending(false);
        }
    };

    if (sent) {
        return (
            <div style={{ padding: '40px 20px', textAlign: 'center', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '80px', height: '80px', background: '#22C55E', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                    <AlertCircle size={40} color="white" />
                </div>
                <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>SOS அனுப்பப்பட்டது ✓</h2>
                <p style={{ color: '#9CA3AF', marginBottom: '8px' }}>Manager has been notified.</p>
                <p style={{ color: '#6B7280', fontSize: '12px', marginBottom: '32px' }}>
                    {coords.lat ? `GPS: ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}` : 'GPS location not captured'}
                </p>
                <button onClick={() => navigate('/home')} style={{ padding: '14px 32px', background: '#22C55E', color: '#111827', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '700', cursor: 'pointer' }}>
                    முகப்புக்கு திரும்பு / Back to Home
                </button>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', maxWidth: '420px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                <button onClick={() => navigate('/home')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'white', padding: '8px 8px 8px 0' }}>
                    <ArrowLeft size={24} />
                </button>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>அவசரகால உதவி</h2>
            </div>

            {/* GPS locate button */}
            <div style={{ background: '#1F2937', borderRadius: '12px', padding: '14px 16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <p style={{ color: '#9CA3AF', fontSize: '13px', margin: 0 }}>உங்கள் இருப்பிடம் · Location</p>
                    <p style={{ color: gpsStatus === 'got' ? '#22C55E' : gpsStatus === 'failed' ? '#EF4444' : '#6B7280', fontSize: '12px', margin: '2px 0 0' }}>
                        {gpsStatus === 'idle' ? 'கணக்கிடப்படவில்லை' : gpsStatus === 'locating' ? 'கண்டறிகிறது...' : gpsStatus === 'got' ? `${coords.lat?.toFixed(4)}, ${coords.lng?.toFixed(4)}` : 'GPS கிடைக்கவில்லை'}
                    </p>
                </div>
                <button onClick={locateAndSend} disabled={locating} style={{ padding: '8px 14px', background: '#374151', border: 'none', borderRadius: '8px', color: '#9CA3AF', cursor: 'pointer', display: 'flex', gap: '6px', alignItems: 'center', fontSize: '12px' }}>
                    <MapPin size={14} /> {locating ? '...' : 'கண்டறி'}
                </button>
            </div>

            <p style={{ fontWeight: '600', marginBottom: '12px' }}>என்ன நடந்தது? / What happened?</p>
            {reasons.map(r => (
                <button key={r.value} onClick={() => setSelected(r.value)} style={{
                    width: '100%', padding: '14px 16px', marginBottom: '8px',
                    background: selected === r.value ? '#1D4ED8' : '#1F2937',
                    border: selected === r.value ? '2px solid #2563EB' : '2px solid transparent',
                    borderRadius: '10px', cursor: 'pointer', textAlign: 'left', color: 'white',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <span style={{ fontWeight: '600' }}>{r.label}</span>
                    <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{r.sublabel}</span>
                </button>
            ))}

            <button onClick={sendSOS} disabled={!selected || sending} style={{
                width: '100%', height: '52px', marginTop: '16px',
                background: selected ? '#DC2626' : '#374151',
                color: 'white', border: 'none', borderRadius: '12px',
                fontSize: '16px', fontWeight: '700',
                cursor: selected ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}>
                <AlertCircle size={20} />
                {sending ? 'அனுப்புகிறது...' : 'SOS அனுப்பு / Send SOS'}
            </button>

            <button onClick={() => navigate('/home')} style={{ width: '100%', padding: '14px', marginTop: '12px', background: 'transparent', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: '14px' }}>
                ரத்து செய் / Cancel
            </button>
        </div>
    );
}
