import { useState, useEffect } from "react";
import { Plus, Eye } from "lucide-react";
import useAppStore from "@/store/useAppStore";
import { format } from "date-fns";

export default function ActiveTripsTable() {
  const store = useAppStore();
  const [localTrips, setLocalTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const base = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
    fetch(`${base}/api/v1/trips`)
      .then(r => r.json())
      .then(data => {
        setLocalTrips(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Trips fetch error:', err);
        setLoading(false);
      });
  }, []);

  const trips = store.trips.length > 0 ? store.trips : localTrips;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "en_route": return "bg-success/10 text-success";
      case "planning": return "bg-primary/10 text-primary";
      case "delayed": return "bg-warning/10 text-warning";
      case "completed": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "en_route": return "En Route";
      case "planning": return "Planning";
      case "delayed": return "Delayed";
      case "completed": return "Completed";
      default: return status;
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-foreground">Active Trips</h2>
        <div className="flex items-center gap-2">
          <select className="text-sm bg-secondary border border-border rounded-lg px-3 h-9 text-foreground">
            <option>All Status</option>
            <option>En Route</option>
            <option>Planning</option>
            <option>Delayed</option>
          </select>
          <button className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 h-10 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            <Plus size={16} />
            New Request
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-background">
              {["Trip ID", "Factory", "Driver", "Material", "Quantity", "ETA", "Status", "Actions"].map((h) => (
                <th key={h} className="text-xs uppercase text-muted-foreground font-semibold tracking-wider text-left px-3 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center py-8 text-gray-400">Loading...</td></tr>
            ) : trips.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-8 text-gray-400">No active trips found</td></tr>
            ) : (
              trips.filter(t => t.status !== 'completed').slice(0, 10).map((t) => (
                <tr key={t.trip_code} className={`h-11 border-t border-border hover:bg-primary/5 transition-colors ${t.status === 'delayed' ? 'bg-warning/5' : ''}`}>
                  <td className="px-3 text-sm font-medium text-foreground">{t.trip_code}</td>
                  <td className="px-3 text-sm text-foreground">{t.factory_name}</td>
                  <td className="px-3 text-sm text-foreground">{t.driver_name}</td>
                  <td className="px-3 text-sm text-foreground">{t.material_type}</td>
                  <td className="px-3 text-sm text-foreground">{t.quantity_kg} kg</td>
                  <td className="px-3 text-sm text-foreground">{t.eta ? format(new Date(t.eta), 'p') : '-'}</td>
                  <td className="px-3">
                    <span className={`text-[11px] font-semibold px-[6px] py-[3px] rounded-[999px] ${getStatusColor(t.status)}`}>{getStatusLabel(t.status)}</span>
                  </td>
                  <td className="px-3">
                    <button className="flex items-center gap-1 text-sm text-primary hover:underline relative">
                      <Eye size={14} />
                      View
                      {t.status === 'delayed' && <span className="w-2 h-2 rounded-full bg-destructive absolute -top-0.5 -right-2" />}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
