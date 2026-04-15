import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute   from './components/ProtectedRoute';
import LoginScreen      from './pages/LoginScreen';
import Layout           from './components/Layout';
import Dashboard        from './pages/Dashboard';
import Pickups          from './pages/Pickups';
import Trips            from './pages/Trips';
import Performance      from './pages/Performance';
import Settings         from './pages/Settings';
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
                        <Route index element={<Navigate to="/dashboard" replace />} />
                        <Route path="dashboard"   element={<Dashboard />} />
                        <Route path="pickups"     element={<Pickups />} />
                        <Route path="trips"       element={<Trips />} />
                        <Route path="performance" element={<Performance />} />
                        <Route path="settings"    element={<Settings />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}
