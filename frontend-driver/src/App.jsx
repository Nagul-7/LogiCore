import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider }       from './context/AuthContext';
import { ActiveTripProvider } from './context/ActiveTripContext';
import ProtectedRoute         from './components/ProtectedRoute';
import Layout    from './components/Layout';
import LoginScreen from './pages/LoginScreen';
import Home      from './pages/Home';
import RoutePage from './pages/Route';
import QRDisplay from './pages/QRDisplay';
import SOS       from './pages/SOS';
import Profile   from './pages/Profile';

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <div style={{ background: '#111827', minHeight: '100vh', color: '#F9FAFB' }}>
                    <Routes>
                        {/* Public */}
                        <Route path="/login" element={<LoginScreen />} />

                        {/* Protected — all wrapped in ActiveTripProvider */}
                        <Route path="/" element={
                            <ProtectedRoute>
                                <ActiveTripProvider>
                                    <Layout />
                                </ActiveTripProvider>
                            </ProtectedRoute>
                        }>
                            <Route index element={<Navigate to="/home" replace />} />
                            <Route path="home"    element={<Home />} />
                            <Route path="route"   element={<RoutePage />} />
                            <Route path="qr"      element={<QRDisplay />} />
                            <Route path="sos"     element={<SOS />} />
                            <Route path="profile" element={<Profile />} />
                        </Route>

                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/home" replace />} />
                    </Routes>
                </div>
            </AuthProvider>
        </BrowserRouter>
    );
}
