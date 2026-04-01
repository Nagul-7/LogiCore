import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, Clock, IndianRupee } from "lucide-react";
import useAppStore from "@/store/useAppStore";
import { format, differenceInMinutes, subDays, isAfter } from "date-fns";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from "recharts";

const barData = [
  { day: "Mon", trips: 4 },
  { day: "Tue", trips: 7 },
  { day: "Wed", trips: 5 },
  { day: "Thu", trips: 8 },
  { day: "Fri", trips: 6 },
  { day: "Sat", trips: 3 },
  { day: "Sun", trips: 9 },
];

const lineData = [
  { day: "Mon", rate: 82 },
  { day: "Tue", rate: 87 },
  { day: "Wed", rate: 85 },
  { day: "Thu", rate: 91 },
  { day: "Fri", rate: 88 },
  { day: "Sat", rate: 93 },
  { day: "Sun", rate: 89 },
];

export default function ReportsPage() {
  const [range, setRange] = useState("Last 7 Days");
  const { trips, kpis } = useAppStore();

  const filteredTrips = useMemo(() => {
    let days = 7;
    if (range === "Last 30 Days") days = 30;
    else if (range === "Last 90 Days") days = 90;

    const cutoff = subDays(new Date(), days);
    return trips.filter(t => t.status === 'completed' && isAfter(new Date(t.created_at || new Date()), cutoff));
  }, [trips, range]);

  const completedTripsList = filteredTrips.map(t => {
    const actual = t.actual_arrival ? new Date(t.actual_arrival) : (t.updated_at ? new Date(t.updated_at) : new Date());
    const planned = t.eta ? new Date(t.eta) : new Date();
    const deviation = differenceInMinutes(actual, planned);
    return {
      id: t.trip_code,
      factory: t.factory_name,
      driver: t.driver_name,
      material: t.material_type,
      planned: t.eta ? format(planned, 'p') : '-',
      actual: (t.actual_arrival || t.updated_at) ? format(actual, 'p') : '-',
      deviation: deviation,
      status: deviation > 15 ? "Late" : (deviation < -15 ? "Early" : "On Time")
    };
  });

  const metrics = [
    { label: "Total Trips", value: kpis.total_trips_today.toString(), trend: "+12%", up: true, icon: TrendingUp },
    { label: "On-Time Deliveries", value: `${kpis.on_time_rate}%`, trend: "+4%", up: true, icon: TrendingUp },
    { label: "Avg Delivery Time", value: "2.4 hrs", trend: "-15 min", up: true, icon: Clock },
    { label: "Cost Saved", value: "₹1.2L", trend: "+8%", up: true, icon: IndianRupee },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Reports</h2>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="text-sm bg-card border border-border rounded-lg px-3 h-10 text-foreground"
        >
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>Last 90 Days</option>
          <option>Custom</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="bg-card border border-border rounded-xl p-6">
            <p className="text-sm text-muted-foreground">{m.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{m.value}</p>
            <div className="flex items-center gap-1 mt-2 text-xs font-medium text-success">
              <m.icon size={14} />
              <span>{m.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-base font-semibold text-foreground mb-4">Daily Trip Volume</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "hsl(215 16% 47%)" }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 12, fill: "hsl(215 16% 47%)" }} />
              <Tooltip />
              <Bar dataKey="trips" fill="hsl(224 76% 48%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-base font-semibold text-foreground mb-4">On-Time Rate Trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "hsl(215 16% 47%)" }} />
              <YAxis domain={[75, 100]} tick={{ fontSize: 12, fill: "hsl(215 16% 47%)" }} />
              <Tooltip />
              <Line type="monotone" dataKey="rate" stroke="hsl(142 71% 45%)" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 overflow-x-auto">
        <h3 className="text-base font-semibold text-foreground mb-4">Recent Completed Trips</h3>
        <table className="w-full">
          <thead>
            <tr className="bg-background">
              {["Trip ID", "Factory", "Driver", "Material", "Planned ETA", "Actual Arrival", "Deviation", "Status"].map((h) => (
                <th key={h} className="text-xs uppercase text-muted-foreground font-semibold tracking-wider text-left px-3 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {completedTripsList.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-center text-sm text-muted-foreground italic">
                  No completed trips found for this time range.
                </td>
              </tr>
            ) : (
              completedTripsList.map((t) => (
                <tr key={t.id} className="h-11 border-t border-border hover:bg-primary/5 transition-colors">
                  <td className="px-3 text-sm font-medium text-foreground">{t.id}</td>
                  <td className="px-3 text-sm text-foreground">{t.factory}</td>
                  <td className="px-3 text-sm text-foreground">{t.driver}</td>
                  <td className="px-3 text-sm text-foreground">{t.material}</td>
                  <td className="px-3 text-sm text-foreground">{t.planned}</td>
                  <td className="px-3 text-sm text-foreground">{t.actual}</td>
                  <td className="px-3">
                    <span className={`text-sm font-medium ${t.deviation > 0 ? "text-destructive" : "text-success"}`}>
                      {t.deviation > 0 ? `+${t.deviation}` : t.deviation} min
                    </span>
                  </td>
                  <td className="px-3">
                    <span className={`text-[11px] font-semibold px-[6px] py-[3px] rounded-[999px] ${
                      t.status === "Late" ? "bg-destructive/10 text-destructive" : t.status === "Early" ? "bg-success/10 text-success" : "bg-primary/10 text-primary"
                    }`}>{t.status}</span>
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
