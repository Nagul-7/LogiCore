import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Package, Eye, EyeOff } from 'lucide-react';

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
        setLoading(true);
        try {
            await login({ email, password });
            navigate('/dashboard', { replace: true });
        } catch {
            setError('Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', background: 'linear-gradient(135deg,#F8FAFC 0%,#EFF6FF 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px', fontFamily: "'Inter', sans-serif"
        }}>
            <div style={{
                width: '100%', maxWidth: '400px', background: 'white',
                borderRadius: '20px', padding: '40px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.1)', border: '1px solid #E2E8F0'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: 56, height: 56, background: 'linear-gradient(135deg,#22C55E,#15803D)',
                        borderRadius: '14px', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', margin: '0 auto 14px'
                    }}>
                        <Package size={26} color="white" />
                    </div>
                    <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', margin: '0 0 4px' }}>Supplier Portal</h1>
                    <p style={{ color: '#64748B', fontSize: '13px', margin: 0 }}>LogiCore · Inbound Logistics</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '14px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                            placeholder="supplier@logicore.demo"
                            style={{ width: '100%', height: '46px', padding: '0 12px', border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', outline: 'none', color: '#0F172A' }} />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                style={{ width: '100%', height: '46px', padding: '0 40px 0 12px', border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', outline: 'none', color: '#0F172A' }} />
                            <button type="button" onClick={() => setShowPw(v => !v)}
                                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {error && <p style={{ color: '#DC2626', fontSize: '13px', marginBottom: '12px', textAlign: 'center' }}>{error}</p>}

                    <button type="submit" disabled={loading} style={{
                        width: '100%', height: '48px', background: 'linear-gradient(135deg,#22C55E,#15803D)',
                        color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px',
                        fontWeight: '700', cursor: 'pointer', opacity: loading ? 0.7 : 1
                    }}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p style={{ color: '#94A3B8', fontSize: '12px', textAlign: 'center', marginTop: '20px' }}>
                    Demo: supplier@logicore.demo · demo1234
                </p>
            </div>
        </div>
    );
}
