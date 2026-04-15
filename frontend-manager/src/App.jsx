import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider }   from './context/AuthContext';
import ProtectedRoute     from './components/ProtectedRoute';
import LoginScreen        from './pages/LoginScreen';
import Layout             from './components/Layout';
import Dashboard          from './pages/Dashboard';
import Logistics          from './pages/Logistics';
import './styles/global.css';

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<LoginScreen />} />
                    <Route path="/" element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<Dashboard />} />
                        <Route path="logistics" element={<Logistics />} />
                        <Route path="settings" element={<div style={{padding:'40px',color:'#64748B'}}>Settings — coming soon</div>} />
                    </Route>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}
