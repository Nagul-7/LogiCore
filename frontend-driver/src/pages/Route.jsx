import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { ArrowLeft, Clock, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../lib/api';
import socket from '../lib/socket';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function RoutePage() {
  const [position, setPosition] = useState([11.3410, 77.7172]);
  const [eta, setEta] = useState('Calculating...');
  const navigate = useNavigate();
  const destination = [10.9601, 76.9199];

  useEffect(() => {
    socket.on('trip:gps_update', (data) => {
      setPosition([data.lat, data.lng]);
    });
    return () => socket.off('trip:gps_update');
  }, []);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 1000, display: 'flex', gap: '8px' }}>
        <button onClick={() => navigate('/home')} style={{ background: '#1F2937', border: 'none', borderRadius: '8px', padding: '10px', cursor: 'pointer', color: 'white' }}>
          <ArrowLeft size={20} />
        </button>
      </div>

      <MapContainer center={position} zoom={10} style={{ flex: 1 }}>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution="CartoDB" />
        <Marker position={position}><Popup>Truck Location</Popup></Marker>
        <Marker position={destination}><Popup>Kurichi SIDCO — Destination</Popup></Marker>
        <Polyline positions={[position, destination]} color="#22C55E" weight={3} />
      </MapContainer>

      <div style={{ background: '#1F2937', borderRadius: '16px 16px 0 0', padding: '20px', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} color="#22C55E" />
            <span style={{ fontSize: '20px', fontWeight: '700' }}>ETA: {eta}</span>
          </div>
          <span style={{ fontSize: '13px', color: '#9CA3AF' }}>Kurichi SIDCO</span>
        </div>
        <button style={{ width: '100%', height: '48px', background: '#22C55E', color: '#111827', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '700', cursor: 'pointer' }}>
          வந்துவிட்டேன் / Arrived
        </button>
      </div>
    </div>
  );
}
