import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Compass, Settings, LogOut, Package } from 'lucide-react';
import useStore from '../store/useStore';

export default function Layout() {
    return (
        <div style={{ display: 'flex', height: '100vh', background: 'var(--color-page-bg)', overflow: 'hidden' }}>
            <Sidebar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Header />
                <main style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

function Sidebar() {
    const { logout } = useStore();

    return (
        <div style={{
            width: '260px', background: 'var(--color-sidebar-bg)', color: 'white',
            display: 'flex', flexDirection: 'column'
        }}>
            <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ width: '36px', height: '36px', background: 'var(--color-primary-btn)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Package size={20} color="white" />
                </div>
                <span style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '0.5px' }}>LOGICORE</span>
            </div>

            <nav style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
                <NavItem to="/logistics" icon={Compass} label="Logistics Control" />
                <NavItem to="/settings" icon={Settings} label="System Settings" />
            </nav>

            <div style={{ padding: '24px 16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <button onClick={logout} style={{
                    display: 'flex', alignItems: 'center', gap: '12px', width: '100%',
                    padding: '12px 16px', background: 'transparent', border: 'none',
                    color: 'var(--color-sidebar-text)', cursor: 'pointer', borderRadius: '8px',
                    textAlign: 'left', fontWeight: '500', fontSize: '14px'
                }}>
                    <LogOut size={20} />
                    Sign Out
                </button>
            </div>
        </div>
    );
}

function NavItem({ to, icon: Icon, label }) {
    return (
        <NavLink to={to} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '12px 16px', borderRadius: '8px',
            textDecoration: 'none', fontSize: '14px', fontWeight: '500',
            background: isActive ? 'var(--color-sidebar-active)' : 'transparent',
            color: isActive ? 'var(--color-sidebar-text-active)' : 'var(--color-sidebar-text)',
            transition: 'all 0.2s'
        })}>
            <Icon size={20} />
            {label}
        </NavLink>
    );
}

function Header() {
    const { user } = useStore();
    return (
        <header style={{
            height: '72px', background: 'var(--color-card-bg)', borderBottom: '1px solid var(--color-card-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 32px'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text-primary)' }}>{user?.name}</p>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>System Manager</p>
                </div>
                <div style={{
                    width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-info-bg)',
                    color: 'var(--color-info)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 'bold', fontSize: '16px'
                }}>
                    {user?.name?.charAt(0) || 'M'}
                </div>
            </div>
        </header>
    );
}
