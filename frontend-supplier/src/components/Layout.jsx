import { NavLink, Outlet } from 'react-router-dom';
import { BarChart3, Package, Truck, TrendingUp, Settings } from 'lucide-react';
import TopBar from './TopBar';

const navItems = [
  { to: '/dashboard', icon: BarChart3, label: 'Dashboard' },
  { to: '/pickups', icon: Package, label: 'Pickups' },
  { to: '/trips', icon: Truck, label: 'Active Trips' },
  { to: '/performance', icon: TrendingUp, label: 'Performance' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const sidebarStyle = {
  width: '240px',
  minHeight: '100vh',
  background: '#1E3A5F',
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
};

const logoStyle = {
  padding: '24px 20px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  borderBottom: '1px solid rgba(255,255,255,0.1)',
};

export default function Layout() {
  return (
    <div style={{ display: 'flex', height: '100vh', background: '#F8FAFC', fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar */}
      <aside style={sidebarStyle}>
        <div style={logoStyle}>
          <div style={{ width: '32px', height: '32px', background: '#3B82F6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Truck size={18} color="white" />
          </div>
          <span style={{ color: 'white', fontSize: '16px', fontWeight: '700', letterSpacing: '-0.3px' }}>LogiCore</span>
        </div>

        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '8px',
                marginBottom: '4px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: isActive ? '600' : '400',
                color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.65)',
                background: isActive ? 'rgba(59,130,246,0.3)' : 'transparent',
                borderLeft: isActive ? '3px solid #3B82F6' : '3px solid transparent',
                transition: 'all 0.15s ease',
              })}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom user badge */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', background: '#0D9488', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: 'white', fontSize: '12px', fontWeight: '700' }}>RS</span>
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ margin: 0, color: 'white', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Rajan Steels</p>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Supplier</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar />
        <main style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', background: '#F1F5F9' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
