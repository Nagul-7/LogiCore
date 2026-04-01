import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Clock, Package } from 'lucide-react';

const chartData = [
  { day: 'Mon', rate: 88 },
  { day: 'Tue', rate: 92 },
  { day: 'Wed', rate: 85 },
  { day: 'Thu', rate: 95 },
  { day: 'Fri', rate: 90 },
  { day: 'Sat', rate: 78 },
  { day: 'Sun', rate: 96 },
];

function MetricCard({ label, value, unit, sub, color, icon: Icon }) {
  return (
    <div style={{
      background: 'white', borderRadius: '12px', padding: '20px 24px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)', borderTop: `4px solid ${color}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ margin: '0 0 6px', fontSize: '12px', color: '#64748B', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
          <p style={{ margin: '0 0 4px', fontSize: '32px', fontWeight: '700', color: '#0F172A' }}>
            {value}<span style={{ fontSize: '16px', fontWeight: '500', color: '#64748B', marginLeft: '4px' }}>{unit}</span>
          </p>
          {sub && <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8' }}>{sub}</p>}
        </div>
        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={20} color={color} />
        </div>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      <p style={{ margin: '0 0 4px', fontWeight: '600', fontSize: '13px', color: '#0F172A' }}>{label}</p>
      <p style={{ margin: 0, fontSize: '13px', color: '#22C55E', fontWeight: '700' }}>{payload[0].value}% on-time</p>
    </div>
  );
};

export default function Performance() {
  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: '700', color: '#0F172A' }}>Performance</h1>
        <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>Rajan Steels · Last 30 days</p>
      </div>

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
        <MetricCard label="On-time Pickup Rate" value={91} unit="%" sub="↑ 3% vs last month" color="#22C55E" icon={TrendingUp} />
        <MetricCard label="Avg Preparation Time" value={42} unit="min" sub="Target: 45 min" color="#3B82F6" icon={Clock} />
        <MetricCard label="Total Trips This Month" value={47} unit="" sub="12 more than Feb" color="#8B5CF6" icon={Package} />
      </div>

      {/* Line chart */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
        <h2 style={{ margin: '0 0 20px', fontSize: '15px', fontWeight: '700', color: '#0F172A' }}>On-Time Rate — Last 7 Days</h2>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData} margin={{ top: 4, right: 16, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="day" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis domain={[60, 100]} tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} unit="%" />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone" dataKey="rate" stroke="#22C55E" strokeWidth={3}
              dot={{ fill: '#22C55E', r: 5, strokeWidth: 2, stroke: 'white' }}
              activeDot={{ r: 7, fill: '#16A34A' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
