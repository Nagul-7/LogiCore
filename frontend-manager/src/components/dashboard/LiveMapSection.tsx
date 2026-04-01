import { RefreshCw } from "lucide-react";
import useAppStore from "@/store/useAppStore";
import { format } from "date-fns";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, shadowUrl: markerShadow });

export default function LiveMapSection() {
  const { truckPositions, trips } = useAppStore();
  const activeTrucksCount = Object.keys(truckPositions).length;

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-foreground">Live Fleet Tracking</h2>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse-dot" />
            {activeTrucksCount} {activeTrucksCount === 1 ? 'truck' : 'trucks'} active
          </span>
          <button className="text-muted-foreground hover:text-foreground">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <MapContainer center={[11.0168, 76.9558]} zoom={10} style={{height:'380px',width:'100%',borderRadius:'8px'}}>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution="CartoDB" />
        {Object.entries(truckPositions).map(([code, pos]: any) => (
          <Marker key={code} position={[pos.lat, pos.lng]}>
            <Popup>{code} &mdash; {pos.speed} km/h</Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Truck summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        {trips.filter(t => t.status !== 'completed').slice(0, 2).map(t => (
          <div key={t.trip_code} className="border border-border rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">{t.trip_code}</p>
              <p className="text-xs text-muted-foreground mt-1">ETA {t.eta ? format(new Date(t.eta), 'p') : '-'}</p>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              t.status === 'en_route' ? 'bg-success/10 text-success' : 
              t.status === 'delayed' ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'
            }`}>
              {t.status === 'en_route' ? 'En Route' : t.status === 'delayed' ? 'Delayed' : 'Planning'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
