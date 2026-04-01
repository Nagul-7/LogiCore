import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import api from '../lib/api';

const reasons = [
  { value: 'breakdown', label: 'வாகன பழுது', sublabel: 'Vehicle Breakdown' },
  { value: 'accident', label: 'விபத்து', sublabel: 'Accident' },
  { value: 'wrong_route', label: 'வழி தெரியவில்லை', sublabel: 'Wrong Route' },
  { value: 'other', label: 'மற்றவை', sublabel: 'Other' },
];

export default function SOS() {
  const [selected, setSelected] = useState('');
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const sendSOS = async () => {
    try {
      await api.post('/api/v1/trips/TRIP-2026-001/sos', { reason: selected, lat: 11.1778, lng: 77.3755 });
      setSent(true);
    } catch (err) {
      console.error('SOS failed:', err);
    }
  };

  if (sent) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '80px', height: '80px', background: '#22C55E', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <AlertCircle size={40} color="white" />
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>மேலாளர் அறிவிக்கப்பட்டார்</h2>
        <p style={{ color: '#9CA3AF', marginBottom: '32px' }}>Manager has been notified. Help is coming.</p>
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

      <div style={{ background: '#1F2937', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
        <p style={{ color: '#9CA3AF', fontSize: '13px', margin: 0 }}>உங்கள் இருப்பிடம் பகிரப்படும் · Location will be shared automatically</p>
      </div>

      <p style={{ fontWeight: '600', marginBottom: '12px' }}>என்ன நடந்தது? / What happened?</p>
      {reasons.map(r => (
        <button key={r.value} onClick={() => setSelected(r.value)} style={{
          width: '100%', padding: '14px 16px', marginBottom: '8px', background: selected === r.value ? '#1D4ED8' : '#1F2937',
          border: selected === r.value ? '2px solid #2563EB' : '2px solid transparent', borderRadius: '10px', cursor: 'pointer',
          textAlign: 'left', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span style={{ fontWeight: '600' }}>{r.label}</span>
          <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{r.sublabel}</span>
        </button>
      ))}

      <button onClick={sendSOS} disabled={!selected} style={{
        width: '100%', height: '52px', marginTop: '16px', background: selected ? '#DC2626' : '#374151',
        color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700',
        cursor: selected ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
      }}>
        <AlertCircle size={20} /> SOS அனுப்பு / Send SOS
      </button>

      <button onClick={() => navigate('/home')} style={{ width: '100%', padding: '14px', marginTop: '12px', background: 'transparent', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: '14px' }}>
        ரத்து செய் / Cancel
      </button>
    </div>
  );
}
