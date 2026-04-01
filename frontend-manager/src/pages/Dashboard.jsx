import React, { useEffect } from 'react';
import useStore from '../store/useStore';
import { Package, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import TripCreator from '../components/TripCreator';

export default function Dashboard() {
    const { kpis, trips, fetchDashboardData } = useStore();
    const [showCreator, setShowCreator] = React.useState(false);

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 30000);
        return () => clearInterval(interval);
    }, []);

    const chartData = [
        { name: 'Mon', trips: 12 }, { name: 'Tue', trips: 19 },
        { name: 'Wed', trips: 15 }, { name: 'Thu', trips: 22 },
        { name: 'Fri', trips: parseInt(kpis?.total_trips_today || 14) },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>Global Dashboard</h1>
                    <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>Real-time overview of inbound logistics</p>
                </div>
                <button onClick={() => setShowCreator(true)} style={{
                    background: 'var(--color-primary-btn)', color: 'white', padding: '12px 24px',
                    borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer'
                }}>
                    + Create New Trip
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
                <KpiCard title="Active Trips" value={kpis?.active_trip_count || 0} icon={Package} color="var(--color-info)" bgColor="var(--color-info-bg)" />
                <KpiCard title="On-Time Rate" value={`${kpis?.on_time_rate || 0}%`} icon={TrendingUp} color="var(--color-success)" bgColor="var(--color-success-bg)" />
                <KpiCard title="Delayed Deliveries" value={kpis?.delayed_count || 0} icon={Clock} color="var(--color-warning)" bgColor="var(--color-warning-bg)" />
                <KpiCard title="Low Stock Alerts" value={kpis?.low_stock_alerts || 0} icon={AlertTriangle} color="var(--color-danger)" bgColor="var(--color-danger-bg)" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                <div style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-card-border)', borderRadius: '12px', padding: '24px' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '24px' }}>Delivery Volume (Weekly)</h2>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                                <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="trips" fill="var(--color-primary-btn)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-card-border)', borderRadius: '12px', padding: '24px' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '24px' }}>Recent Events</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {trips.slice(0, 4).map(t => (
                            <div key={t.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
                                <div style={{
                                    width: '8px', height: '8px', borderRadius: '50%',
                                    background: t.status === 'pending' ? 'var(--color-warning)' : 'var(--color-success)'
                                }} />
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '14px', fontWeight: '600' }}>{t.factory_name}</p>
                                    <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{t.status.toUpperCase()} - {t.material_type}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {showCreator && <TripCreator onClose={() => setShowCreator(false)} />}
        </div>
    );
}

function KpiCard({ title, value, icon: Icon, color, bgColor }) {
    return (
        <div style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-card-border)', borderRadius: '12px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: bgColor, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={28} />
            </div>
            <div>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>{title}</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>{value}</p>
            </div>
        </div>
    );
}
