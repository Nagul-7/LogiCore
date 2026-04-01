import { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, Upload, X } from 'lucide-react';
import api from '../lib/api';

const TYPES = [
  { value: 'wrong_quantity', label: 'Wrong Quantity', sub: 'Actual weight differs from manifest' },
  { value: 'wrong_material', label: 'Wrong Material', sub: 'Material type does not match' },
  { value: 'damaged',        label: 'Damaged Goods', sub: 'Goods received in damaged condition' },
  { value: 'other',          label: 'Other',          sub: 'Other issue not listed above' },
];

export default function Discrepancy() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { trip_code } = state || {};

  const [type, setType] = useState('');
  const [actualQty, setActualQty] = useState('');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState([null, null]);
  const [previews, setPreviews] = useState([null, null]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const refs = [useRef(), useRef()];

  const handlePhoto = (idx, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      setPhotos(p => { const n = [...p]; n[idx] = file; return n; });
      setPreviews(p => { const n = [...p]; n[idx] = e.target.result; return n; });
    };
    reader.readAsDataURL(file);
  };

  const submit = async () => {
    if (!type) return;
    setSubmitting(true);
    try {
      await api.post(`/api/v1/epods/1/discrepancy`, {
        discrepancy_type: type,
        discrepancy_notes: notes,
        actual_qty_kg: parseFloat(actualQty) || 0,
        trip_code,
      });
      setSubmitted(true);
      setTimeout(() => navigate('/scanner'), 2200);
    } catch {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ maxWidth: 500, margin: '80px auto', textAlign: 'center' }}>
        <AlertTriangle size={56} color="#D97706" style={{ marginBottom: 16 }} />
        <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#92400E', margin: '0 0 8px' }}>Discrepancy Reported</h2>
        <p style={{ color: '#64748B' }}>Manager has been notified. Returning to scanner…</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ borderTop: '5px solid #D97706', padding: '24px 32px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <AlertTriangle size={36} color="#D97706" />
          <div>
            <h1 style={{ margin: '0 0 3px', fontSize: '20px', fontWeight: '800', color: '#0F172A' }}>Report Discrepancy</h1>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>{trip_code || 'Unknown Trip'} — குறைபாடு அறிக்கை</p>
          </div>
        </div>

        <div style={{ padding: '0 32px 32px' }}>
          {/* Type selection */}
          <p style={{ fontWeight: '700', fontSize: '14px', color: '#0F172A', margin: '0 0 10px' }}>What is the issue?</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
            {TYPES.map(t => (
              <label key={t.value} style={{
                display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px',
                borderRadius: '10px', border: `2px solid ${type === t.value ? '#D97706' : '#E2E8F0'}`,
                background: type === t.value ? '#FFFBEB' : 'white', cursor: 'pointer',
                transition: 'all 0.15s',
              }}>
                <input type="radio" name="dtype" value={t.value} checked={type === t.value} onChange={() => setType(t.value)}
                  style={{ accentColor: '#D97706', width: 18, height: 18, flexShrink: 0 }} />
                <div>
                  <p style={{ margin: '0 0 2px', fontWeight: '700', fontSize: '14px', color: '#0F172A' }}>{t.label}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>{t.sub}</p>
                </div>
              </label>
            ))}
          </div>

          {/* Actual quantity */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
              Actual Quantity Received (kg)
            </label>
            <input type="number" value={actualQty} onChange={e => setActualQty(e.target.value)}
              placeholder="e.g. 3200"
              style={{ width: '100%', height: '56px', padding: '0 16px', border: '2px solid #E2E8F0', borderRadius: '10px', fontSize: '16px', color: '#1E293B', boxSizing: 'border-box', outline: 'none' }}
              onFocus={e => e.target.style.borderColor='#D97706'}
              onBlur={e => e.target.style.borderColor='#E2E8F0'}
            />
          </div>

          {/* Notes */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
              Notes / Additional Details
            </label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Describe the discrepancy in detail…"
              style={{ width: '100%', height: '96px', padding: '12px 16px', border: '2px solid #E2E8F0', borderRadius: '10px', fontSize: '14px', color: '#1E293B', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit', outline: 'none' }}
              onFocus={e => e.target.style.borderColor='#D97706'}
              onBlur={e => e.target.style.borderColor='#E2E8F0'}
            />
          </div>

          {/* Photo uploads */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
              Evidence Photos (optional)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[0, 1].map(idx => (
                <div key={idx}>
                  <input type="file" accept="image/*" ref={refs[idx]} style={{ display: 'none' }} onChange={e => handlePhoto(idx, e.target.files[0])} />
                  {previews[idx] ? (
                    <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', height: '120px' }}>
                      <img src={previews[idx]} alt={`Photo ${idx+1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button onClick={() => { setPhotos(p=>{const n=[...p];n[idx]=null;return n;}); setPreviews(p=>{const n=[...p];n[idx]=null;return n;}); }}
                        style={{ position: 'absolute', top: '6px', right: '6px', background: '#DC2626', border: 'none', borderRadius: '50%', width: 26, height: 26, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={14} color="white" />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => refs[idx].current?.click()} style={{
                      width: '100%', height: '120px', background: '#F8FAFC', border: '2px dashed #CBD5E1',
                      borderRadius: '10px', cursor: 'pointer', display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#94A3B8', transition: 'all 0.15s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor='#D97706'; e.currentTarget.style.color='#D97706'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor='#CBD5E1'; e.currentTarget.style.color='#94A3B8'; }}>
                      <Upload size={24} />
                      <span style={{ fontSize: '13px', fontWeight: '600' }}>Photo {idx + 1}</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button onClick={submit} disabled={!type || submitting}
            style={{ width: '100%', height: '56px', background: type ? '#DC2626' : '#CBD5E1', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: type ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <AlertTriangle size={20} /> {submitting ? 'Submitting…' : 'Submit Discrepancy Report'}
          </button>
          <button onClick={() => navigate(-1)} style={{ width: '100%', marginTop: '10px', padding: '12px', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '14px' }}>
            ← Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
