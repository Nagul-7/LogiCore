import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: '100vh', background: '#111827', color: '#9CA3AF', fontSize: '14px'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: 40, height: 40, border: '3px solid #374151',
                        borderTop: '3px solid #22C55E', borderRadius: '50%',
                        animation: 'spin 1s linear infinite', margin: '0 auto 12px'
                    }} />
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    <p style={{ margin: 0 }}>சரிபார்க்கிறது...</p>
                </div>
            </div>
        );
    }

    if (!user) return <Navigate to="/login" replace />;
    return children;
}
