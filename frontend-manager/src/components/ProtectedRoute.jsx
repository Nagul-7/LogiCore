import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0F172A' }}>
            <div style={{ width: 44, height: 44, border: '3px solid #1E293B', borderTop: '3px solid #3B82F6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );
    if (!user) return <Navigate to="/login" replace />;
    return children;
}
