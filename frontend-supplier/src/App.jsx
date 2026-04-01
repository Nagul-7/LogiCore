import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Pickups from './pages/Pickups';
import Trips from './pages/Trips';
import Performance from './pages/Performance';
import Settings from './pages/Settings';
import './styles/global.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="pickups" element={<Pickups />} />
          <Route path="trips" element={<Trips />} />
          <Route path="performance" element={<Performance />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
