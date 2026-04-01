import { Outlet, NavLink } from 'react-router-dom';
import { Truck, ScanLine, ClipboardList } from 'lucide-react';

export default function Layout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F1F5F9', fontFamily: "'Inter', sans-serif" }}>
      {/* Top bar */}
      <header style={{
        height: '64px', background: '#1E3A5F', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 28px', flexShrink: 0,
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      }}>
        {/* Left: logo + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '36px', height: '36px', background: '#3B82F6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Truck size={20} color="white" />
          </div>
          <div>
            <span style={{ color: 'white', fontWeight: '700', fontSize: '16px', letterSpacing: '-0.3px' }}>LogiCore</span>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginLeft: '10px' }}>Gate Security Terminal</span>
          </div>
        </div>

        {/* Center: nav */}
        <nav style={{ display: 'flex', gap: '4px' }}>
          <NavLink to="/scanner" style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
            borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: '600',
            color: isActive ? '#111827' : 'rgba(255,255,255,0.75)',
            background: isActive ? '#22C55E' : 'transparent',
            transition: 'all 0.15s',
          })}>
            <ScanLine size={16} /> Scanner
          </NavLink>
          <NavLink to="/entries" style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
            borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: '600',
            color: isActive ? '#111827' : 'rgba(255,255,255,0.75)',
            background: isActive ? '#22C55E' : 'transparent',
            transition: 'all 0.15s',
          })}>
            <ClipboardList size={16} /> Entries
          </NavLink>
        </nav>

        {/* Right: guard info */}
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, color: 'white', fontSize: '13px', fontWeight: '600' }}>Suresh</p>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Kurichi SIDCO Gate 3</p>
        </div>
      </header>

      <main style={{ flex: 1, padding: '24px 28px' }}>
        <Outlet />
      </main>
    </div>
  );
}
