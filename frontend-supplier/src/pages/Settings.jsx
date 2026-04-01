import { Building2, Phone, Mail, Bell, Shield } from 'lucide-react';

function Section({ title, children }) {
  return (
    <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', marginBottom: '20px' }}>
      <h3 style={{ margin: '0 0 18px', fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{label}</label>
      <input
        defaultValue={value}
        readOnly
        style={{
          width: '100%', padding: '9px 12px', border: '1px solid #E2E8F0', borderRadius: '8px',
          fontSize: '14px', color: '#1E293B', background: '#F8FAFC', boxSizing: 'border-box',
          fontFamily: 'inherit',
        }}
      />
    </div>
  );
}

function Toggle({ label, sub, checked }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #F1F5F9' }}>
      <div>
        <p style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: '600', color: '#1E293B' }}>{label}</p>
        <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8' }}>{sub}</p>
      </div>
      <div style={{
        width: '42px', height: '24px', borderRadius: '12px', background: checked ? '#22C55E' : '#CBD5E1',
        position: 'relative', cursor: 'pointer', transition: 'background 0.2s',
      }}>
        <div style={{
          position: 'absolute', top: '3px', left: checked ? '21px' : '3px', width: '18px', height: '18px',
          background: 'white', borderRadius: '50%', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }} />
      </div>
    </div>
  );
}

export default function Settings() {
  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: '700', color: '#0F172A' }}>Settings</h1>
        <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>Manage your supplier profile and preferences</p>
      </div>

      <Section title="Company Information">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Field label="Company Name" value="Rajan Steels" />
          <Field label="GST Number" value="33AAFCR1234N1Z5" />
          <Field label="Contact Person" value="Rajan Kumar" />
          <Field label="Phone" value="+91 98765 00001" />
        </div>
        <Field label="Email" value="rajan@rajansteels.com" />
        <Field label="Address" value="SF No. 12, SIDCO Phase 1, Coimbatore – 641021" />
      </Section>

      <Section title="Notification Preferences">
        <Toggle label="Pickup Reminders" sub="Get notified 2 hours before scheduled pickup" checked={true} />
        <Toggle label="Driver Dispatch Alerts" sub="When driver is assigned to your pickup" checked={true} />
        <Toggle label="Delay Notifications" sub="When a delay is reported on your trip" checked={false} />
        <Toggle label="ETA Updates" sub="Real-time ETA changes via SMS" checked={true} />
      </Section>

      <Section title="Security">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '4px 0' }}>
          <Shield size={18} color="#3B82F6" />
          <span style={{ fontSize: '14px', color: '#374151' }}>Two-factor authentication is <strong>enabled</strong></span>
        </div>
      </Section>
    </div>
  );
}
