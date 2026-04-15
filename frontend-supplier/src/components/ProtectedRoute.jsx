import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return (
        <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#F8FAFC' }}>
            <div style={{ width:40,height:40,border:'3px solid #E2E8F0',borderTop:'3px solid #22C55E',borderRadius:'50%',animation:'spin 1s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );
    if (!user) return <Navigate to="/login" replace />;
    return children;
}
