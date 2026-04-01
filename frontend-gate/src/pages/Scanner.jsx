import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, Clock, Truck } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../lib/api';
import socket from '../lib/socket';

const SCAN_LINE_CSS = `
  @keyframes scanAnim { 0% { top: 0% } 100% { top: 98% } }
  .scan-line { position: absolute; height: 2px; background: #22C55E; width: 100%;
    animation: scanAnim 2s linear infinite; box-shadow: 0 0 8px #22C55E; }
  #qr-reader video { width: 100% !important; height: 100% !important; object-fit: cover; }
  #qr-reader { border: none !important; }
`;

const STATUS_STYLE = {
  planning:  { bg: '#EFF6FF', color: '#1D4ED8', label: 'Planning' },
  en_route:  { bg: '#FEF9C3', color: '#D97706', label: 'En Route' },
  at_gate:   { bg: '#F0FDF4', color: '#16A34A', label: 'At Gate' },
  completed: { bg: '#DCFCE7', color: '#166534', label: 'Completed' },
};
function Badge({ status }) {
  const s = STATUS_STYLE[status] || { bg: '#F1F5F9', color: '#475569', label: status };
  return <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '700', background: s.bg, color: s.color }}>{s.label}</span>;
}

function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{ position: 'fixed', top: '80px', right: '20px', zIndex: 9999, padding: '14px 20px', borderRadius: '10px', background: '#1E3A5F', color: 'white', fontWeight: '600', fontSize: '14px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '10px' }}>
      <Truck size={18} color="#22C55E" /> {msg}
    </div>
  );
}

export default function Scanner() {
  const navigate = useNavigate();
  const scannerRef = useRef(null);
  const processedRef = useRef(false);
  const [cameraStatus, setCameraStatus] = useState('starting');
  const [manualInput, setManualInput] = useState('');
  const [entries, setEntries] = useState([]);
  const [pending, setPending] = useState([]);
  const [toast, setToast] = useState(null);

  const handleScan = useCallback(async (text) => {
    if (processedRef.current) return;
    processedRef.current = true;
    try {
      const parsed = JSON.parse(text);
      const res = await api.post('/api/v1/qr/validate', { token: parsed.token, factory_id: 1 });
      navigate('/result', { state: { result: res.data, raw: parsed } });
    } catch (err) {
      const reason = err?.response?.data?.reason || 'Invalid QR format';
      navigate('/result', { state: { result: { valid: false, reason } } });
    }
  }, [navigate]);

  // Start camera — deferred so DOM is ready, errors handled gracefully
  useEffect(() => {
    let scanner;
    let cancelled = false;
    const timer = setTimeout(async () => {
      if (cancelled) return;
      try {
        scanner = new Html5Qrcode('qr-reader');
        scannerRef.current = scanner;
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (text) => { scanner.stop().catch(() => {}); handleScan(text); },
          () => {}
        );
        if (!cancelled) setCameraStatus('active');
      } catch {
        if (!cancelled) setCameraStatus('error');
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (scanner) scanner.stop().catch(() => {});
    };
  }, []); // eslint-disable-line

  const fetchData = useCallback(() => {
    api.get('/api/v1/trips').then(r => {
      const all = Array.isArray(r.data) ? r.data : (r.data.trips || []);
      const today = new Date().toDateString();
      setEntries(all.filter(t => ['completed','at_gate'].includes(t.status) && new Date(t.updated_at || t.created_at).toDateString() === today).slice(0, 8));
      setPending(all.filter(t => t.status === 'en_route').slice(0, 5));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    fetchData();
    socket.on('trip:arrived', (data) => { setToast(`Truck ${data.trip_code} is at the gate`); fetchData(); });
    return () => socket.off('trip:arrived');
  }, [fetchData]);

  const handleManualKey = (e) => {
    if (e.key === 'Enter' && manualInput.trim()) {
      const val = manualInput.trim();
      setManualInput('');
      handleScan(val);
    }
  };

  return (
    <>
      <style>{SCAN_LINE_CSS}</style>
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
      <div style={{ display: 'grid', gridTemplateColumns: '60% 1fr', gap: '20px', height: 'calc(100vh - 116px)' }}>

        {/* LEFT — QR Scanner */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <QrCode size={22} color="#1E3A5F" />
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#0F172A' }}>Scan Driver QR Code</h1>
          </div>

          {/* Camera box */}
          <div style={{ position: 'relative', flex: 1, minHeight: '340px', background: '#1E293B', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>
            <div id="qr-reader" style={{ width: '100%', height: '100%' }} />
            {cameraStatus === 'active' && <div className="scan-line" />}
            {/* Corner markers */}
            {[['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v,h]) => (
              <div key={v+h} style={{
                position: 'absolute', [v]: '50%', [h]: '50%',
                transform: `translate(${h==='left'?'-':''}125px, ${v==='top'?'-':''}125px)`,
                width: 28, height: 28,
                borderTop: v==='top' ? '3px solid #22C55E' : 'none',
                borderBottom: v==='bottom' ? '3px solid #22C55E' : 'none',
                borderLeft: h==='left' ? '3px solid #22C55E' : 'none',
                borderRight: h==='right' ? '3px solid #22C55E' : 'none',
                borderRadius: v==='top'&&h==='left'?'4px 0 0 0': v==='top'&&h==='right'?'0 4px 0 0': v==='bottom'&&h==='left'?'0 0 0 4px':'0 0 4px 0',
              }} />
            ))}
          </div>

          {/* Status indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: cameraStatus==='active'?'#22C55E': cameraStatus==='error'?'#DC2626':'#D97706', boxShadow: cameraStatus==='active'?'0 0 6px #22C55E':'none' }} />
            <span style={{ fontSize: '14px', color: cameraStatus==='error'?'#DC2626':'#64748B', fontWeight: '500' }}>
              {cameraStatus==='active'?'Camera active — ready to scan': cameraStatus==='error'?'Camera unavailable — use manual entry below':'Starting camera...'}
            </span>
          </div>

          {/* Manual fallback */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
              Manual QR Entry — paste JSON and press Enter
            </label>
            <input
              value={manualInput} onChange={e => setManualInput(e.target.value)} onKeyDown={handleManualKey}
              placeholder='{"token":"...","trip_code":"TRIP-2026-001","driver_id":1}'
              style={{ width: '100%', height: '56px', padding: '0 14px', border: '2px solid #E2E8F0', borderRadius: '10px', fontSize: '13px', fontFamily: 'monospace', color: '#1E293B', background: '#F8FAFC', boxSizing: 'border-box', outline: 'none' }}
              onFocus={e => e.target.style.borderColor='#3B82F6'}
              onBlur={e => e.target.style.borderColor='#E2E8F0'}
            />
          </div>
        </div>

        {/* RIGHT — Activity panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
          {/* Today's Entries */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <h2 style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: '700', color: '#0F172A' }}>Today's Entries</h2>
            {entries.length === 0
              ? <p style={{ color: '#94A3B8', fontSize: '13px', textAlign: 'center', padding: '16px 0' }}>No entries today yet.</p>
              : entries.map((t, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#F8FAFC', borderRadius: '8px', marginBottom: '6px' }}>
                  <div>
                    <p style={{ margin: '0 0 2px', fontWeight: '700', fontSize: '13px', color: '#1E293B' }}>{t.trip_code}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>{t.driver_name || 'Driver'} · {t.material_type}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <Badge status={t.status} />
                    <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                      {t.updated_at ? new Date(t.updated_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                </div>
              ))
            }
          </div>

          {/* Pending Arrivals */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <h2 style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: '700', color: '#0F172A' }}>
              Pending Arrivals
              {pending.length > 0 && <span style={{ marginLeft: 8, fontSize: '11px', background: '#D97706', color: 'white', padding: '2px 8px', borderRadius: '999px' }}>{pending.length}</span>}
            </h2>
            {pending.length === 0
              ? <p style={{ color: '#94A3B8', fontSize: '13px', textAlign: 'center', padding: '16px 0' }}>No trucks en route.</p>
              : pending.map((t, i) => (
                <div key={i} style={{ padding: '12px 14px', background: '#FFFBEB', borderRadius: '10px', borderLeft: '3px solid #D97706', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ margin: '0 0 2px', fontWeight: '700', fontSize: '13px', color: '#0F172A' }}>{t.trip_code}</p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>{t.driver_name || 'Driver'} · {t.material_type}</p>
                    </div>
                    {t.eta && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={12} color="#D97706" />
                        <span style={{ fontSize: '12px', color: '#D97706', fontWeight: '600' }}>
                          {new Date(t.eta).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </>
  );
}
