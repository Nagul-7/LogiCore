import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import RoutePage from './pages/Route';
import QRDisplay from './pages/QRDisplay';
import SOS from './pages/SOS';
import Profile from './pages/Profile';

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ background: '#111827', minHeight: '100vh', color: '#F9FAFB' }}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/home" />} />
            <Route path="home" element={<Home />} />
            <Route path="route" element={<RoutePage />} />
            <Route path="qr" element={<QRDisplay />} />
            <Route path="sos" element={<SOS />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}
