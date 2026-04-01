import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell } from 'lucide-react';

const breadcrumbMap = {
  '/dashboard': 'Dashboard',
  '/pickups': 'Pickups',
  '/trips': 'Active Trips',
  '/performance': 'Performance',
  '/settings': 'Settings',
};

export default function TopBar() {
  const location = useLocation();
  const [lang, setLang] = useState('EN');
  const label = breadcrumbMap[location.pathname] || 'Dashboard';

  return (
    <header style={{
      height: '64px',
      background: 'white',
      borderBottom: '1px solid #E2E8F0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      flexShrink: 0,
    }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '12px', color: '#94A3B8' }}>Supplier Portal</span>
        <span style={{ color: '#CBD5E1' }}>/</span>
        <span style={{ fontSize: '13px', fontWeight: '600', color: '#1E293B' }}>{label}</span>
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            placeholder="Search trips..."
            style={{
              paddingLeft: '32px', paddingRight: '12px', height: '34px', border: '1px solid #E2E8F0',
              borderRadius: '8px', fontSize: '13px', background: '#F8FAFC', color: '#1E293B', outline: 'none', width: '200px',
            }}
          />
        </div>

        {/* Language toggle */}
        <button
          onClick={() => setLang(l => l === 'EN' ? 'தமிழ்' : 'EN')}
          style={{
            padding: '5px 12px', borderRadius: '999px', border: '1px solid #CBD5E1',
            background: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: '600',
            color: '#475569', display: 'flex', alignItems: 'center', gap: '4px',
          }}
        >
          {lang === 'EN' ? 'EN | தமிழ்' : 'தமிழ் | EN'}
        </button>

        {/* Bell */}
        <button style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: '6px' }}>
          <Bell size={18} color="#64748B" />
          <span style={{
            position: 'absolute', top: '4px', right: '4px', width: '8px', height: '8px',
            background: '#EF4444', borderRadius: '50%', border: '2px solid white',
          }} />
        </button>
      </div>
    </header>
  );
}
