import { useState, useEffect } from "react";
import { Plus, Search, X, Circle } from "lucide-react";
import useAppStore from "@/store/useAppStore";
import api from "@/lib/api";
import { format } from "date-fns";



function cargoColor(pct: number) {
  if (pct > 85) return "bg-destructive";
  if (pct > 60) return "bg-warning";
  return "bg-primary";
}

function TruckCard({ v }: { v: any }) {
  const pct = v.max > 0 ? Math.round((v.load / v.max) * 100) : 0;
  const fillColor = cargoColor(pct);
  const fillColorHex = pct > 85 ? "#DC2626" : pct > 60 ? "#D97706" : "#2563EB";

  return (
    <div className="bg-card border border-border rounded-xl p-4 w-full">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-bold text-foreground">{v.id}</p>
        <span className={`text-[11px] font-semibold px-[6px] py-[3px] rounded-[999px] ${v.statusColor}`}>{v.status}</span>
      </div>
      <p className="text-xs text-muted-foreground mb-3">{v.model}</p>

      {/* CSS Truck */}
      <div className="flex items-end gap-0 mb-2" style={{ height: 70, width: 160 }}>
        {/* Cab */}
        <div className="flex flex-col justify-end">
          <div className="bg-foreground/70 rounded-t" style={{ width: 40, height: 50 }} />
        </div>
        {/* Cargo container */}
        <div className="relative bg-border rounded-t overflow-hidden" style={{ width: 120, height: 45 }}>
          <div className={fillColor} style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%` }} />
          {pct > 0 && (
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white z-10">{pct}%</span>
          )}
        </div>
      </div>
      {/* Wheels */}
      <div className="flex gap-[104px] ml-[12px] mb-3">
        <div className="w-4 h-4 rounded-full bg-foreground/80" />
        <div className="w-4 h-4 rounded-full bg-foreground/80" />
      </div>

      {/* Load bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>0 kg</span>
          <span>{v.max.toLocaleString()} kg</span>
        </div>
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${fillColor}`} style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-muted-foreground text-center">{v.load.toLocaleString()} / {v.max.toLocaleString()} kg</p>
      </div>
      {v.trip && <p className="text-xs text-primary font-medium mt-2">{v.trip}</p>}
    </div>
  );
}



const statusColors: Record<string, string> = {
  "En Route": "bg-success/10 text-success",
  Planning: "bg-primary/10 text-primary",
  Delayed: "bg-warning/10 text-warning",
  Completed: "bg-muted text-muted-foreground",
  Cancelled: "bg-destructive/10 text-destructive",
};

const timelineEvents = [
  { label: "Created", time: "8:00 AM", done: true },
  { label: "Assigned", time: "8:15 AM", done: true },
  { label: "Departed", time: "9:30 AM", done: true },
  { label: "En Route", time: "10:00 AM", done: true },
  { label: "Arrived", time: "—", done: false },
];

export default function TripsPage() {
  const { trips } = useAppStore();
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedTrip, setSelectedTrip] = useState<any | null>(null);
  const [trucks, setTrucks] = useState<any[]>([]);
  const [localTrips, setLocalTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/v1/drivers').then(r => {
      setTrucks(r.data);
    });
    fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:3000'}/api/v1/trips`)
      .then(r => r.json())
      .then(data => {
        setLocalTrips(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Trips fetch failed:', err);
        setLoading(false);
      });
  }, []);

  const displayTrips = trips.length > 0 ? trips : localTrips;

  const displayTrucks = trucks.map(d => {
    const activeTrip = displayTrips.find(t => t.trip_code === d.active_trip);
    const load = activeTrip ? parseFloat(activeTrip.quantity_kg) : 0;
    const max = d.capacity_kg ? parseFloat(d.capacity_kg) : 10000;
    return {
      id: d.plate_number || `Unknown Plate`,
      model: d.truck_model || "Standard Truck",
      status: activeTrip ? "In Transit" : "Available",
      statusColor: activeTrip ? "bg-warning/10 text-warning" : "bg-success/10 text-success",
      load,
      max,
      trip: activeTrip ? activeTrip.trip_code : null
    };
  });

  const filtered = displayTrips.filter((t) => {
    const statusMap: Record<string, string> = {
      "En Route": "en_route",
      "Planning": "planning",
      "Delayed": "delayed",
      "Completed": "completed",
      "Cancelled": "cancelled"
    };
    const mappedFilter = statusMap[statusFilter];
    const matchStatus = statusFilter === "All" || t.status === mappedFilter;
    const searchLower = search.toLowerCase();
    const matchSearch = search === "" || 
      (t.trip_code && t.trip_code.toLowerCase().includes(searchLower)) || 
      (t.factory_name && t.factory_name.toLowerCase().includes(searchLower)) || 
      (t.driver_name && t.driver_name.toLowerCase().includes(searchLower));
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Fleet Status */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-3">Fleet Status</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayTrucks.slice(0, 3).map((v) => (
            <TruckCard key={v.id} v={v} />
          ))}
        </div>
      </div>

      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-3">
        <button className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 h-10 rounded-lg text-sm font-medium">
          <Plus size={16} /> New Request
        </button>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm bg-card border border-border rounded-lg px-3 h-10 text-foreground"
        >
          <option>All</option>
          <option>En Route</option>
          <option>Planning</option>
          <option>Delayed</option>
          <option>Completed</option>
          <option>Cancelled</option>
        </select>
        <div className="flex items-center bg-card border border-border rounded-lg px-3 h-10 w-64">
          <Search size={16} className="text-muted-foreground mr-2" />
          <input
            type="text"
            placeholder="Search trips..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl p-6 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-background">
              {["Trip ID", "Factory", "Driver", "Material", "Quantity", "ETA", "Status", "Date"].map((h) => (
                <th key={h} className="text-xs uppercase text-muted-foreground font-semibold tracking-wider text-left px-3 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center py-8 text-gray-400">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-8 text-gray-400">No active trips found</td></tr>
            ) : (
              filtered.map((t) => {
                const displayStatus = t.status === "en_route" ? "En Route" :
                                      t.status === "planning" ? "Planning" :
                                      t.status === "delayed" ? "Delayed" :
                                      t.status === "completed" ? "Completed" :
                                      t.status === "cancelled" ? "Cancelled" : t.status;
                const statusColor = statusColors[displayStatus] || "";
                                      
                return (
                  <tr
                    key={t.trip_code}
                    onClick={() => setSelectedTrip(t)}
                    className={`h-11 border-t border-border hover:bg-primary/5 transition-colors cursor-pointer ${t.status === "delayed" ? "bg-warning/5" : ""}`}
                  >
                    <td className="px-3 text-sm font-medium text-foreground">{t.trip_code}</td>
                    <td className="px-3 text-sm text-foreground">{t.factory_name}</td>
                    <td className="px-3 text-sm text-foreground">{t.driver_name}</td>
                    <td className="px-3 text-sm text-foreground">{t.material_type}</td>
                    <td className="px-3 text-sm text-foreground">{t.quantity_kg} kg</td>
                    <td className="px-3 text-sm text-foreground">{t.eta ? format(new Date(t.eta), 'p') : '-'}</td>
                    <td className="px-3">
                      <span className={`text-[11px] font-semibold px-[6px] py-[3px] rounded-[999px] ${statusColor}`}>{displayStatus}</span>
                    </td>
                    <td className="px-3 text-sm text-muted-foreground">{t.created_at ? format(new Date(t.created_at), 'yyyy-MM-dd') : '-'}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Slide-in panel */}
      {selectedTrip && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSelectedTrip(null)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-card border-l border-border shadow-xl overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">{selectedTrip.trip_code}</h2>
                <button onClick={() => setSelectedTrip(null)} className="text-muted-foreground hover:text-foreground">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["Factory", selectedTrip.factory_name],
                    ["Driver", selectedTrip.driver_name],
                    ["Material", selectedTrip.material_type],
                    ["Quantity", `${selectedTrip.quantity_kg} kg`],
                    ["ETA", selectedTrip.eta ? format(new Date(selectedTrip.eta), 'p') : '-'],
                    ["Status", selectedTrip.status],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <p className="text-muted-foreground text-xs">{k}</p>
                      <p className="font-medium text-foreground">{v}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-foreground mb-4">Trip Timeline</h3>
                  <div className="space-y-0">
                    {timelineEvents.map((e, i) => (
                      <div key={e.label} className="flex items-start gap-3">
                        <div className="flex flex-col items-center">
                          <Circle size={12} className={e.done ? "text-primary fill-primary" : "text-border"} />
                          {i < timelineEvents.length - 1 && (
                            <div className={`w-0.5 h-8 ${e.done ? "bg-primary" : "bg-border"}`} />
                          )}
                        </div>
                        <div className="pb-6">
                          <p className={`text-sm ${e.done ? "font-medium text-foreground" : "text-muted-foreground"}`}>{e.label}</p>
                          <p className="text-xs text-muted-foreground">{e.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button className="flex-1 bg-primary text-primary-foreground h-10 rounded-lg text-sm font-medium">Modify Trip</button>
                <button className="flex-1 border border-destructive text-destructive h-10 rounded-lg text-sm font-medium">Cancel Trip</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
