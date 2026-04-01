import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

export default function QRDisplay() {
  const [token, setToken] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.post('/api/v1/qr/generate', { trip_code: 'TRIP-2026-001' })
      .then(r => {
        setToken(r.data.token);
        setExpiresAt(new Date(r.data.expires_at));
      })
      .catch(err => console.error('QR generation failed:', err));
  }, []);

  useEffect(() => {
    if (!expiresAt) return;
    const timer = setInterval(() => {
      const diff = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      setTimeLeft(`${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
    }, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  const qrValue = token ? JSON.stringify({ token, trip_code: 'TRIP-2026-001', driver_id: 1 }) : '';
  const isExpiringSoon = timeLeft && parseInt(timeLeft.split(':')[0]) === 0 && parseInt(timeLeft.split(':')[1]) < 15;

  return (
    <div style={{ padding: '20px', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
        <button onClick={() => navigate('/home')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'white', padding: '8px' }}>
          <ArrowLeft size={24} />
        </button>
        <h2 style={{ margin: '0 auto', fontSize: '18px', fontWeight: '600' }}>நுழைவு QR குறியீடு</h2>
      </div>

      <div style={{ background: 'white', padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
        {token ? (
          <QRCodeSVG value={qrValue} size={220} bgColor="white" fgColor="#111827" />
        ) : (
          <div style={{ width: '220px', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>
            Generating...
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>TRIP-2026-001</p>
        <p style={{ color: '#9CA3AF', fontSize: '14px', margin: '0 0 4px' }}>முருகன் · TRK-CBE-0042</p>
        <p style={{ color: '#9CA3AF', fontSize: '14px', margin: 0 }}>Pig Iron · 3,500 kg</p>
      </div>

      {timeLeft && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Clock size={16} color={isExpiringSoon ? '#DC2626' : '#9CA3AF'} />
          <span style={{ color: isExpiringSoon ? '#DC2626' : '#9CA3AF', fontSize: '14px' }}>
            Expires in: {timeLeft}
          </span>
        </div>
      )}

      <p style={{ color: '#9CA3AF', fontSize: '14px', textAlign: 'center' }}>
        காவலரிடம் காட்டுங்கள்<br />
        <span style={{ fontSize: '12px' }}>Show this to the gate guard</span>
      </p>
    </div>
  );
}
