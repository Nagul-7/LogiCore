import { useState, useEffect } from "react";
import { Truck, CheckCircle, AlertCircle, Package, TrendingUp } from "lucide-react";
import useAppStore from "@/store/useAppStore";

export default function KpiCards() {
  const store = useAppStore();
  const [localKpis, setLocalKpis] = useState<any>(null);

  useEffect(() => {
    const base = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
    fetch(`${base}/api/v1/kpis`)
      .then(r => r.json())
      .then(data => {
        setLocalKpis(data);
      })
      .catch(err => {
        console.error('KPIs fetch error:', err);
      });
  }, []);

  const kpis = store.kpis && store.kpis.active_trips !== undefined ? store.kpis : (localKpis || { active_trips: 0, on_time_rate: 0, delayed_trips: 0, low_stock_alerts: 0 });

  const cards = [
    {
      label: "Active trips",
      value: kpis.active_trips.toString(),
      valueColor: "text-foreground",
      icon: Truck,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      delta: "+3 from yesterday",
      deltaColor: "text-success",
      deltaIcon: TrendingUp,
    },
    {
      label: "On-time delivery",
      value: `${kpis.on_time_rate}%`,
      valueColor: "text-foreground",
      icon: CheckCircle,
      iconBg: "bg-success/10",
      iconColor: "text-success",
      delta: "+4%",
      deltaColor: "text-success",
      deltaIcon: TrendingUp,
    },
    {
      label: "Delayed",
      value: kpis.delayed_trips.toString(),
      valueColor: "text-destructive",
      icon: AlertCircle,
      iconBg: "bg-destructive/10",
      iconColor: "text-destructive",
      delta: "Needs attention",
      deltaColor: "text-destructive",
    },
    {
      label: "Low stock",
      value: kpis.low_stock_alerts.toString(),
      valueColor: "text-warning",
      icon: Package,
      iconBg: "bg-warning/10",
      iconColor: "text-warning",
      delta: "Auto-reorder pending",
      deltaColor: "text-warning",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div key={c.label} className="bg-card border border-border rounded-xl p-6 relative">
          <div className={`absolute top-4 right-4 w-10 h-10 ${c.iconBg} rounded-full flex items-center justify-center`}>
            <c.icon size={20} className={c.iconColor} />
          </div>
          <p className={`text-3xl font-bold ${c.valueColor}`}>{c.value}</p>
          <p className="text-sm text-muted-foreground mt-1">{c.label}</p>
          <div className={`flex items-center gap-1 mt-3 text-xs font-medium ${c.deltaColor}`}>
            {c.deltaIcon && <c.deltaIcon size={14} />}
            <span>{c.delta}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
