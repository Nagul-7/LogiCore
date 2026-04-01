import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Truck, Package } from 'lucide-react';
import api from '../lib/api';

const REASON_MAP = {
  already_used: 'QR குறியீடு ஏற்கனவே பயன்படுத்தப்பட்டது / QR already used',
  expired:      'QR குறியீட்டின் காலம் முடிந்தது / QR code expired',
  wrong_factory:'தவறான தொழிற்சாலை / Wrong factory',
  not_found:    'QR குறியீடு கண்டுபிடிக்கவில்லை / QR not found',
};

function DetailRow({ label, value, highlight }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <p style={{ margin: '0 0 3px', fontSize: '11px', fontWeight: '600', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
      <p style={{ margin: 0, fontSize: '15px', fontWeight: highlight ? '700' : '500', color: '#0F172A' }}>{value || '—'}</p>
    </div>
  );
}

export default function Result() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { result, raw } = state || {};
  const [logging, setLogging] = useState(false);
  const [logged, setLogged] = useState(false);

  // Redirect in effect, not during render
  useEffect(() => {
    if (!result) navigate('/scanner');
  }, [result, navigate]);

  if (!result) return <div style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>Redirecting…</div>;

  // ── APPROVED ────────────────────────────────────────────────
  if (result.valid) {
    const isLate = result.eta && new Date() > new Date(result.eta);

    const acceptEntry = async () => {
      setLogging(true);
      try {
        await api.post('/api/v1/epods', {
          trip_code: result.trip_code,
          received_qty_kg: result.quantity_kg,
          status: 'accepted',
        });
        setLogged(true);
        setTimeout(() => navigate('/scanner'), 1800);
      } catch {
        setLogging(false);
      }
    };

    if (logged) {
      return (
        <div style={{ maxWidth: 600, margin: '60px auto', textAlign: 'center' }}>
          <CheckCircle size={64} color="#16A34A" style={{ marginBottom: 16 }} />
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#15803D', margin: '0 0 8px' }}>Entry Logged!</h2>
          <p style={{ color: '#64748B' }}>Returning to scanner…</p>
        </div>
      );
    }

    return (
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          {/* Green header */}
          <div style={{ borderTop: '5px solid #16A34A', padding: '28px 32px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <CheckCircle size={48} color="#16A34A" />
            <div>
              <h1 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: '800', color: '#16A34A' }}>Entry Approved</h1>
              <p style={{ margin: 0, fontSize: '15px', color: '#64748B' }}>அனுமதிக்கப்பட்டது · {result.trip_code}</p>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <span style={{ padding: '6px 16px', borderRadius: '999px', fontSize: '13px', fontWeight: '700', background: isLate ? '#FEE2E2' : '#DCFCE7', color: isLate ? '#DC2626' : '#16A34A' }}>
                {isLate ? 'Late' : 'On Time'}
              </span>
            </div>
          </div>

          {/* Details grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', padding: '0 32px 24px' }}>
            <div style={{ padding: '20px 20px 0 0', borderRight: '1px solid #F1F5F9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Truck size={16} color="#3B82F6" />
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Trip Details</span>
              </div>
              <DetailRow label="Trip ID" value={result.trip_code} highlight />
              <DetailRow label="Driver" value={result.driver_name} />
              <DetailRow label="Phone" value={result.driver_phone} />
              <DetailRow label="Truck" value={result.truck_plate || raw?.trip_code} />
            </div>
            <div style={{ padding: '20px 0 0 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Package size={16} color="#3B82F6" />
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cargo Details</span>
              </div>
              <DetailRow label="Material" value={result.material_type} highlight />
              <DetailRow label="Expected Quantity" value={result.quantity_kg ? `${Number(result.quantity_kg).toLocaleString()} kg` : '—'} />
              <DetailRow label="Supplier" value={result.supplier_name} />
              {result.eta && <DetailRow label="Expected ETA" value={new Date(result.eta).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} />}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ padding: '0 32px 32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={acceptEntry}
              disabled={logging}
              style={{ width: '100%', height: '56px', background: '#16A34A', color: 'white', border: 'none', borderRadius: '12px', fontSize: '18px', fontWeight: '700', cursor: logging ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', opacity: logging ? 0.7 : 1 }}
            >
              <CheckCircle size={22} /> {logging ? 'Logging Entry…' : 'Accept & Enter'}
            </button>
            <button
              onClick={() => navigate('/discrepancy', { state: { trip_code: result.trip_code } })}
              style={{ width: '100%', height: '48px', background: 'transparent', color: '#DC2626', border: '2px solid #DC2626', borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}
            >
              Reject / Discrepancy — நிராகரிக்கவும்
            </button>
            <button onClick={() => navigate('/scanner')} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '14px', padding: '4px' }}>
              ← Back to Scanner
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── REJECTED ────────────────────────────────────────────────
  const reasonText = REASON_MAP[result.reason] || result.reason || 'Unknown error';
  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <div style={{ borderTop: '5px solid #DC2626', padding: '28px 32px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <XCircle size={48} color="#DC2626" />
          <div>
            <h1 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: '800', color: '#DC2626' }}>Entry Rejected</h1>
            <p style={{ margin: 0, fontSize: '15px', color: '#64748B' }}>நிராகரிக்கப்பட்டது</p>
          </div>
        </div>

        <div style={{ padding: '0 32px 16px' }}>
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '16px 20px' }}>
            <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: '700', color: '#991B1B' }}>Reason / காரணம்</p>
            <p style={{ margin: 0, fontSize: '15px', color: '#7F1D1D', lineHeight: '1.6' }}>{reasonText}</p>
          </div>
        </div>

        <div style={{ padding: '8px 32px 32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button onClick={() => navigate('/scanner')} style={{ width: '100%', height: '56px', background: '#1E3A5F', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: 'pointer' }}>
            ← Scan Again
          </button>
          <button
            onClick={() => { window.location.href = 'tel:+919876543210'; }}
            style={{ width: '100%', height: '48px', background: '#FEF2F2', color: '#DC2626', border: '2px solid #FECACA', borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}
          >
            📞 Call Manager — +91 98765 43210
          </button>
        </div>
      </div>
    </div>
  );
}
