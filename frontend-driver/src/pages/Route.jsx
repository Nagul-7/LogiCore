import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { ArrowLeft, Clock, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../lib/api';
import socket from '../lib/socket';
import { useActiveTrip } from '../context/ActiveTripContext';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function RoutePage() {
  const { activeTrip } = useActiveTrip();
  const [position, setPosition] = useState([11.3410, 77.7172]);
  const [eta, setEta] = useState('Calculating...');
  const [destination, setDestination] = useState(null);
  const [polyline, setPolyline] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (activeTrip?.trip_code) {
      api.get(`/api/v1/trips/${activeTrip.trip_code}/route`)
        .then(r => {
          if (r.data.eta) setEta(Math.round(r.data.duration_min) + " mins");
          if (r.data.route_coords) setPolyline(r.data.route_coords);
          // Set destination from activeTrip if we had coords in backend, else fallback
          // The backend /route returns route details, our polyline ends at destination
          if (r.data.route_coords?.length) {
            setDestination(r.data.route_coords[r.data.route_coords.length - 1]);
            setPosition(r.data.route_coords[0]);
          }
        })
        .catch(e => console.error(e));
        
      if (activeTrip.eta) {
          // Fallback ETA from trip object
          const eDate = new Date(activeTrip.eta);
          if (!isNaN(eDate.getTime())) {
              setEta(eDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
          }
      }
    }
  }, [activeTrip?.trip_code, activeTrip?.eta]);

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
        {destination && <Marker position={destination}><Popup>{activeTrip?.factory_name || 'Destination'}</Popup></Marker>}
        {polyline.length > 0 && <Polyline positions={polyline} color="#22C55E" weight={4} />}
      </MapContainer>

      <div style={{ background: '#1F2937', borderRadius: '16px 16px 0 0', padding: '20px', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} color="#22C55E" />
            <span style={{ fontSize: '20px', fontWeight: '700' }}>ETA: {eta}</span>
          </div>
          <span style={{ fontSize: '13px', color: '#9CA3AF' }}>{activeTrip?.factory_name || 'Destination'}</span>
        </div>
        <button 
          disabled={!activeTrip}
          onClick={() => {
            if (activeTrip) {
              api.post(`/api/v1/trips/${activeTrip.trip_code}/arrive`).then(() => navigate('/home'));
            }
          }}
          style={{ width: '100%', height: '48px', background: '#22C55E', color: '#111827', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '700', cursor: activeTrip ? 'pointer' : 'default', opacity: activeTrip ? 1 : 0.5 }}>
          வந்துவிட்டேன் / Arrived
        </button>
      </div>
    </div>
  );
}
