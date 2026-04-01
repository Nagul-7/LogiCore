import { User, Star, Phone } from 'lucide-react';

export default function Profile() {
  const driver = { name: 'முருகன்', phone: '+91 98765 43201', reliability: 92, trips: 47 };

  return (
    <div style={{ padding: '20px', maxWidth: '420px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>சுயவிவரம் / Profile</h2>

      <div style={{ background: '#1F2937', borderRadius: '12px', padding: '24px', textAlign: 'center', marginBottom: '16px' }}>
        <div style={{ width: '64px', height: '64px', background: '#22C55E', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
          <span style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>மு</span>
        </div>
        <h3 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 4px' }}>{driver.name}</h3>
        <p style={{ color: '#9CA3AF', margin: 0 }}>{driver.phone}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <div style={{ background: '#1F2937', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
          <p style={{ color: '#9CA3AF', fontSize: '12px', margin: '0 0 4px' }}>நம்பகத்தன்மை</p>
          <p style={{ fontSize: '24px', fontWeight: '700', color: '#22C55E', margin: 0 }}>{driver.reliability}%</p>
        </div>
        <div style={{ background: '#1F2937', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
          <p style={{ color: '#9CA3AF', fontSize: '12px', margin: '0 0 4px' }}>மொத்த பணிகள்</p>
          <p style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>{driver.trips}</p>
        </div>
      </div>
    </div>
  );
}
