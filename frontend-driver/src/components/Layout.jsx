import { Outlet, NavLink } from 'react-router-dom';
import { Home, Navigation, QrCode, User, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const tabs = [
  { to: '/home', icon: Home, label: 'முகப்பு' },
  { to: '/route', icon: Navigation, label: 'வழி' },
  { to: '/qr', icon: QrCode, label: 'QR' },
  { to: '/profile', icon: User, label: 'சுயவிவரம்' },
];

export default function Layout() {
  const navigate = useNavigate();
  return (
    <div style={{ paddingBottom: '64px', minHeight: '100vh' }}>
      <Outlet />
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '64px', background: '#1A2332', borderTop: '1px solid #374151', display: 'flex', alignItems: 'center', justifyContent: 'space-around', zIndex: 50 }}>
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
            color: isActive ? '#22C55E' : '#6B7280', textDecoration: 'none', fontSize: '10px'
          })}>
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <button onClick={() => navigate('/sos')} style={{
        position: 'fixed', bottom: '80px', right: '16px', width: '52px', height: '52px',
        background: '#DC2626', borderRadius: '50%', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, boxShadow: '0 4px 12px rgba(220,38,38,0.4)'
      }}>
        <AlertCircle color="white" size={24} />
      </button>
    </div>
  );
}
