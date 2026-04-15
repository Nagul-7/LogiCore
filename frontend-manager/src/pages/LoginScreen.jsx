import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Truck, Eye, EyeOff } from 'lucide-react';

export default function LoginScreen() {
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw]     = useState(false);
    const [error, setError]       = useState('');
    const [loading, setLoading]   = useState(false);
    const { login } = useAuth();
    const navigate  = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!email || !password) { setError('All fields required'); return; }
        setLoading(true);
        try {
            await login({ email, password });
            navigate('/', { replace: true });
        } catch {
            setError('Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px', fontFamily: "'Inter', sans-serif"
        }}>
            <div style={{
                width: '100%', maxWidth: '420px',
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '20px', padding: '40px',
                boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: 60, height: 60,
                        background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                        borderRadius: '16px', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', margin: '0 auto 16px',
                        boxShadow: '0 0 24px rgba(59,130,246,0.4)'
                    }}>
                        <Truck size={28} color="white" />
                    </div>
                    <h1 style={{ color: 'white', fontSize: '24px', fontWeight: '800', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
                        LogiCore
                    </h1>
                    <p style={{ color: '#94A3B8', fontSize: '13px', margin: 0 }}>Manager Dashboard</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', color: '#CBD5E1', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
                            Email Address
                        </label>
                        <input
                            type="email" value={email} onChange={e => setEmail(e.target.value)}
                            placeholder="manager@logicore.demo"
                            style={{
                                width: '100%', height: '48px', padding: '0 14px',
                                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                                borderRadius: '10px', color: 'white', fontSize: '14px',
                                boxSizing: 'border-box', outline: 'none'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', color: '#CBD5E1', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
                            Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPw ? 'text' : 'password'} value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                style={{
                                    width: '100%', height: '48px', padding: '0 44px 0 14px',
                                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                                    borderRadius: '10px', color: 'white', fontSize: '14px',
                                    boxSizing: 'border-box', outline: 'none'
                                }}
                            />
                            <button type="button" onClick={() => setShowPw(v => !v)}
                                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px' }}>
                            <p style={{ color: '#FCA5A5', fontSize: '13px', margin: 0 }}>{error}</p>
                        </div>
                    )}

                    <button type="submit" disabled={loading} style={{
                        width: '100%', height: '50px',
                        background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                        color: 'white', border: 'none', borderRadius: '12px',
                        fontSize: '15px', fontWeight: '700', cursor: 'pointer',
                        boxShadow: '0 4px 16px rgba(59,130,246,0.35)',
                        opacity: loading ? 0.7 : 1
                    }}>
                        {loading ? 'Signing in...' : 'Sign In →'}
                    </button>
                </form>

                <p style={{ color: '#475569', fontSize: '12px', textAlign: 'center', marginTop: '20px' }}>
                    Demo: manager@logicore.demo · 123456
                </p>
            </div>
        </div>
    );
}
