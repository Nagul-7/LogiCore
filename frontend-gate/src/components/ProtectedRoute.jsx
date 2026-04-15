import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return (
        <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#0F172A' }}>
            <div style={{ width:48,height:48,border:'4px solid #1E293B',borderTop:'4px solid #1D4ED8',borderRadius:'50%',animation:'spin 1s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );
    if (!user) return <Navigate to="/login" replace />;
    return children;
}
