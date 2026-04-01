import { useState, useEffect } from "react";
import useAppStore from "@/store/useAppStore";
function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? "bg-success" : score >= 60 ? "bg-warning" : "bg-destructive";
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-medium text-foreground">{score}%</span>
    </div>
  );
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { trips } = useAppStore();

  useEffect(() => {
    const base = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
    fetch(`${base}/api/v1/drivers`)
      .then(r => r.json())
      .then(data => {
        setDrivers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Drivers fetch error:', err);
        setLoading(false);
      });
  }, []);

  const getInitials = (name: string) => {
    const engMatch = name.match(/\(([^)]+)\)/);
    const text = engMatch ? engMatch[1] : name;
    return text.substring(0, 2).toUpperCase();
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-background">
            {["Driver", "Status", "Current Trip", "Reliability", "Actions"].map((h) => (
              <th key={h} className="text-xs uppercase text-muted-foreground font-semibold tracking-wider text-left px-3 py-3">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={5} className="text-center py-8 text-gray-400">Loading...</td></tr>
          ) : drivers.length === 0 ? (
            <tr><td colSpan={5} className="text-center py-8 text-gray-400">No drivers found</td></tr>
          ) : (
            drivers.map((d: any) => {
              const currentTrip = trips.find((t: any) => t.trip_code === d.active_trip);
              const tripCode = d.active_trip || (currentTrip ? currentTrip.trip_code : null);
              const online = d.is_online === true;
              
              return (
              <tr key={d.id} className="h-14 border-t border-border hover:bg-primary/5 transition-colors">
                <td className="px-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold">
                      {getInitials(d.name)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{d.name}</p>
                      <p className="text-xs text-muted-foreground">{d.phone}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3">
                  <span className={`text-[11px] font-semibold px-[6px] py-[3px] rounded-[999px] ${online ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                    {online ? "Online" : "Offline"}
                  </span>
                </td>
                <td className="px-3 text-sm text-foreground">{tripCode || <span className="text-success font-medium">Available</span>}</td>
                <td className="px-3"><ScoreBar score={Math.round(d.reliability_score || 0)} /></td>
                <td className="px-3">
                  <button className="text-sm text-primary hover:underline">View</button>
                </td>
              </tr>
            )})
          )}
        </tbody>
      </table>
    </div>
  );
}
