import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Truck, Delete } from 'lucide-react';

const NUMPAD = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

export default function LoginScreen() {
    const [phone, setPhone]   = useState('');
    const [pin, setPin]       = useState('');
    const [step, setStep]     = useState('phone'); // 'phone' | 'pin'
    const [error, setError]   = useState('');
    const [loading, setLoading] = useState(false);
    const { login }   = useAuth();
    const navigate    = useNavigate();

    const handleNumpad = (val) => {
        setError('');
        if (step === 'phone') {
            if (val === '⌫') { setPhone(p => p.slice(0,-1)); return; }
            if (phone.length < 10) setPhone(p => p + val);
        } else {
            if (val === '⌫') { setPin(p => p.slice(0,-1)); return; }
            if (pin.length < 6) setPin(p => p + val);
        }
    };

    const handleNext = async () => {
        if (step === 'phone') {
            if (phone.length < 10) { setError('10 இலக்க எண் தேவை'); return; }
            setStep('pin');
        } else {
            if (pin.length < 4) { setError('குறைந்தது 4 இலக்கங்கள் தேவை'); return; }
            setLoading(true);
            try {
                await login({ phone, password: pin });
                navigate('/home', { replace: true });
            } catch {
                setError('தொலைபேசி அல்லது PIN தவறானது');
                setPin('');
            } finally {
                setLoading(false);
            }
        }
    };

    const display = step === 'phone'
        ? phone.padEnd(10, '·').split('').join(' ')
        : '● '.repeat(pin.length).trim() || '· · · · · ·';

    return (
        <div style={{
            minHeight: '100vh', background: '#0F172A',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '24px', fontFamily: "'Noto Sans Tamil', 'Inter', sans-serif"
        }}>
            {/* Logo */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{
                    width: 64, height: 64, background: 'linear-gradient(135deg,#22C55E,#16A34A)',
                    borderRadius: '16px', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', margin: '0 auto 16px',
                    boxShadow: '0 0 32px rgba(34,197,94,0.3)'
                }}>
                    <Truck size={32} color="white" />
                </div>
                <h1 style={{ color: 'white', fontSize: '24px', fontWeight: '700', margin: '0 0 4px' }}>
                    LogiCore
                </h1>
                <p style={{ color: '#9CA3AF', fontSize: '13px', margin: 0 }}>
                    {step === 'phone' ? 'தொலைபேசி எண் உள்ளிடவும்' : 'PIN உள்ளிடவும்'}
                </p>
            </div>

            {/* Display */}
            <div style={{
                background: '#1F2937', borderRadius: '16px', padding: '20px 32px',
                marginBottom: '8px', width: '100%', maxWidth: '320px',
                textAlign: 'center', border: '1px solid #374151'
            }}>
                <p style={{
                    color: '#F9FAFB', fontSize: step === 'phone' ? '22px' : '28px',
                    fontFamily: 'monospace', margin: 0, letterSpacing: '4px'
                }}>{display}</p>
            </div>

            {/* Step label */}
            <p style={{ color: '#6B7280', fontSize: '12px', marginBottom: '20px' }}>
                {step === 'phone' ? 'Phone Number' : 'Enter PIN'}
            </p>

            {/* Numpad */}
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px', width: '100%', maxWidth: '320px', marginBottom: '16px'
            }}>
                {NUMPAD.map((key, i) => (
                    <button
                        key={i}
                        onClick={() => key && handleNumpad(key)}
                        disabled={!key}
                        style={{
                            height: '64px', borderRadius: '12px',
                            background: key === '⌫' ? '#374151' : key ? '#1F2937' : 'transparent',
                            border: key ? '1px solid #374151' : 'none',
                            color: key === '⌫' ? '#EF4444' : '#F9FAFB',
                            fontSize: key === '⌫' ? '20px' : '22px',
                            fontWeight: '600', cursor: key ? 'pointer' : 'default',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'background 0.15s'
                        }}
                        onMouseDown={e => e.currentTarget.style.background = key === '⌫' ? '#4B5563' : '#374151'}
                        onMouseUp={e => e.currentTarget.style.background = key === '⌫' ? '#374151' : '#1F2937'}
                    >
                        {key === '⌫' ? <Delete size={20} /> : key}
                    </button>
                ))}
            </div>

            {/* Error */}
            {error && (
                <p style={{ color: '#EF4444', fontSize: '13px', margin: '0 0 12px', textAlign: 'center' }}>
                    {error}
                </p>
            )}

            {/* CTA Button */}
            <button
                onClick={handleNext}
                disabled={loading}
                style={{
                    width: '100%', maxWidth: '320px', height: '56px',
                    background: 'linear-gradient(135deg,#22C55E,#16A34A)',
                    color: '#0F172A', border: 'none', borderRadius: '14px',
                    fontSize: '18px', fontWeight: '700', cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(34,197,94,0.35)',
                    opacity: loading ? 0.7 : 1
                }}
            >
                {loading ? '...' : step === 'phone' ? 'அடுத்து →' : 'உள்நுழைய'}
            </button>

            {step === 'pin' && (
                <button
                    onClick={() => { setStep('phone'); setPin(''); setError(''); }}
                    style={{
                        marginTop: '12px', background: 'transparent', border: 'none',
                        color: '#6B7280', fontSize: '13px', cursor: 'pointer'
                    }}
                >
                    ← திரும்பு
                </button>
            )}

            <p style={{ color: '#4B5563', fontSize: '11px', marginTop: '24px' }}>
                Demo: Phone 9876543201 · PIN 123456
            </p>
        </div>
    );
}
