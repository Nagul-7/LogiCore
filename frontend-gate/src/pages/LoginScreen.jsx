import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Delete } from 'lucide-react';

const NUMPAD = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

export default function LoginScreen() {
    const [badgeId, setBadgeId] = useState('');
    const [pin, setPin]         = useState('');
    const [step, setStep]       = useState('badge');
    const [error, setError]     = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate  = useNavigate();

    const handleNumpad = (val) => {
        setError('');
        if (val === '⌫') {
            step === 'badge' ? setBadgeId(p => p.slice(0,-1)) : setPin(p => p.slice(0,-1));
            return;
        }
        if (step === 'badge' && badgeId.length < 10) setBadgeId(p => p + val);
        if (step === 'pin'   && pin.length < 6)      setPin(p => p + val);
    };

    const handleNext = async () => {
        if (step === 'badge') { if (badgeId) setStep('pin'); return; }
        setLoading(true);
        try {
            // Gate guards login with email (badge maps to email field as phone)
            await login({ phone: badgeId, password: pin });
            navigate('/scanner', { replace: true });
        } catch {
            setError('Invalid Badge ID or PIN');
            setPin('');
        } finally { setLoading(false); }
    };

    const display = step === 'badge'
        ? (badgeId || '— — — —')
        : '● '.repeat(pin.length).trim() || '· · · · · ·';

    return (
        <div style={{
            minHeight: '100vh', background: 'linear-gradient(160deg,#0F172A 0%,#1E3A5F 100%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '24px', fontFamily: "'Inter', sans-serif"
        }}>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <div style={{
                    width: 72, height: 72, background: 'linear-gradient(135deg,#1D4ED8,#1E40AF)',
                    borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px', boxShadow: '0 0 32px rgba(29,78,216,0.5)'
                }}>
                    <Shield size={36} color="white" />
                </div>
                <h1 style={{ color: 'white', fontSize: '22px', fontWeight: '800', margin: '0 0 4px' }}>Gate Security</h1>
                <p style={{ color: '#94A3B8', fontSize: '13px', margin: 0 }}>
                    {step === 'badge' ? 'Enter Badge ID' : 'Enter PIN'}
                </p>
            </div>

            {/* Display */}
            <div style={{
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '16px', padding: '20px 40px', marginBottom: '20px',
                width: '100%', maxWidth: '360px', textAlign: 'center'
            }}>
                <p style={{ color: 'white', fontSize: '28px', fontFamily: 'monospace', letterSpacing: '6px', margin: 0 }}>
                    {display}
                </p>
            </div>

            {/* Numpad — large tap targets */}
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
                gap: '14px', width: '100%', maxWidth: '360px', marginBottom: '16px'
            }}>
                {NUMPAD.map((key, i) => (
                    <button key={i} onClick={() => key && handleNumpad(key)} disabled={!key}
                        style={{
                            height: '80px', borderRadius: '16px',
                            background: key === '⌫' ? 'rgba(239,68,68,0.2)' : key ? 'rgba(255,255,255,0.08)' : 'transparent',
                            border: key ? '1px solid rgba(255,255,255,0.1)' : 'none',
                            color: key === '⌫' ? '#EF4444' : 'white',
                            fontSize: '26px', fontWeight: '700', cursor: key ? 'pointer' : 'default',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                        {key === '⌫' ? <Delete size={24} /> : key}
                    </button>
                ))}
            </div>

            {error && <p style={{ color: '#FCA5A5', fontSize: '14px', margin: '0 0 12px', fontWeight: '600' }}>{error}</p>}

            <button onClick={handleNext} disabled={loading || (!badgeId && step === 'badge') || (!pin && step === 'pin')}
                style={{
                    width: '100%', maxWidth: '360px', height: '64px',
                    background: 'linear-gradient(135deg,#1D4ED8,#1E40AF)',
                    color: 'white', border: 'none', borderRadius: '16px',
                    fontSize: '20px', fontWeight: '800', cursor: 'pointer',
                    boxShadow: '0 4px 24px rgba(29,78,216,0.4)',
                    opacity: loading ? 0.7 : 1
                }}>
                {loading ? '...' : step === 'badge' ? 'Next →' : 'Unlock →'}
            </button>

            {step === 'pin' && (
                <button onClick={() => { setStep('badge'); setPin(''); }} style={{ marginTop: '12px', background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '14px' }}>
                    ← Back
                </button>
            )}

            <p style={{ color: '#334155', fontSize: '11px', marginTop: '24px' }}>
                Demo: Badge 9000000003 · PIN 123456
            </p>
        </div>
    );
}
