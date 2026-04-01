import { useState, useEffect } from "react";
import { AlertCircle, Download, Star, Search } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import api from "@/lib/api";
import useAppStore from "@/store/useAppStore";
import { formatDistanceToNow } from "date-fns";

const movementData = [
  { date: "2026-03-31", time: "09:15 AM", type: "Incoming", material: "Pig Iron", supplier: "Erode Steel Distributors", status: "Good" },
  { date: "2026-03-31", time: "10:30 AM", type: "Outgoing", material: "Coke", supplier: "Kurichi Castings", status: "Good" },
  { date: "2026-03-31", time: "11:00 AM", type: "Incoming", material: "Scrap Metal", supplier: "Salem Scrap Traders", status: "Pending" },
  { date: "2026-03-30", time: "02:15 PM", type: "Outgoing", material: "Steel Rods", supplier: "Ganapathy Eng", status: "Good" },
  { date: "2026-03-30", time: "03:45 PM", type: "Incoming", material: "Raw Materials", supplier: "Surat Raw Exports", status: "Good" },
  { date: "2026-03-30", time: "05:00 PM", type: "Outgoing", material: "Sand", supplier: "Peelamedu Works", status: "Reject" },
];

function StockBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

const statusColors: Record<string, string> = {
  Good: "bg-success/10 text-success",
  Pending: "bg-warning/10 text-warning",
  Reject: "bg-destructive/10 text-destructive",
  Low: "bg-destructive/10 text-destructive",
};

const typeColors: Record<string, string> = {
  Incoming: "bg-success/10 text-success",
  Outgoing: "bg-destructive/10 text-destructive",
};

export default function InventoryPage() {
  const { alerts } = useAppStore();
  const [stockChartData, setStockChartData] = useState<any[]>([]);
  const [stockTracking, setStockTracking] = useState<any[]>([]);

  useEffect(() => {
    const base = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
    api.get(`${base}/api/v1/kpis/inventory/weekly`).then(r => {
      console.log('Weekly data received:', r.data);
      setStockChartData(r.data);
    });
    api.get(`${base}/api/v1/kpis/inventory/latest`).then(r => setStockTracking(r.data));
  }, []);

  const inventoryAlerts = alerts.filter(a => a.type === "inventory");

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Incoming Materials</p>
            <select className="text-xs bg-secondary border border-border rounded px-2 py-1 text-foreground">
              <option>Weekly</option>
            </select>
          </div>
          <p className="text-2xl font-bold text-foreground">129 <span className="text-sm font-normal text-muted-foreground">tonnes this week</span></p>
          <div className="flex gap-1 mt-3 h-2 rounded-full overflow-hidden">
            <div className="bg-primary" style={{ width: "40%" }} />
            <div className="bg-warning" style={{ width: "25%" }} />
            <div className="bg-purple-500" style={{ width: "20%" }} />
            <div className="bg-accent" style={{ width: "15%" }} />
          </div>
          <div className="flex items-center gap-1 mt-2 text-xs font-medium text-success">
            <span>+10% vs last week</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Current Stock</p>
            <select className="text-xs bg-secondary border border-border rounded px-2 py-1 text-foreground">
              <option>Weekly</option>
            </select>
          </div>
          <p className="text-2xl font-bold text-foreground">110 <span className="text-sm font-normal text-muted-foreground">tonnes total</span></p>
          <div className="flex gap-1 mt-3 h-2 rounded-full overflow-hidden">
            <div className="bg-primary" style={{ width: "35%" }} />
            <div className="bg-warning" style={{ width: "30%" }} />
            <div className="bg-purple-500" style={{ width: "20%" }} />
            <div className="bg-accent" style={{ width: "15%" }} />
          </div>
          <div className="flex items-center gap-1 mt-2 text-xs font-medium text-destructive">
            <span>-8% vs last week</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Low Stock Items</p>
            <AlertCircle size={18} className="text-warning" />
          </div>
          <p className="text-2xl font-bold text-destructive">{inventoryAlerts.length}</p>
          <p className="text-sm text-muted-foreground mt-1">items need reorder</p>
        </div>
      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-foreground">Stock Overview</h3>
            <select className="text-xs bg-secondary border border-border rounded px-2 py-1 text-foreground">
              <option>Weekly</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stockChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "hsl(215 16% 47%)" }} />
              <YAxis domain={[0, 10000]} tick={{ fontSize: 12, fill: "hsl(215 16% 47%)" }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="incoming" fill="hsl(224 76% 48%)" radius={[4, 4, 0, 0]} name="Incoming" />
              <Bar dataKey="outgoing" fill="hsl(213 94% 78%)" radius={[4, 4, 0, 0]} name="Outgoing" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-2 mt-4">
            <button className="flex items-center gap-1.5 border border-border rounded-lg px-3 h-9 text-sm text-muted-foreground hover:text-foreground">
              <Download size={14} /> CSV
            </button>
            <button className="flex items-center gap-1.5 border border-border rounded-lg px-3 h-9 text-sm text-muted-foreground hover:text-foreground">
              <Download size={14} /> PDF
            </button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Star size={16} className="text-warning fill-warning" />
            <h3 className="text-base font-semibold text-foreground">AI Reorder Alerts</h3>
          </div>
          <div className="space-y-4">
            {inventoryAlerts.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No active inventory alerts.</p>
            ) : (
              inventoryAlerts.map((a, i) => (
                <div key={a.id} className="border border-border rounded-lg p-4 space-y-2">
                  <p className="text-sm font-semibold text-foreground">Inventory Alert</p>
                  <p className="text-xs text-muted-foreground">{a.message}</p>
                  <p className="text-xs text-muted-foreground">{formatDistanceToNow(a.id, { addSuffix: true })}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 overflow-x-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-foreground">Movement & Transactions</h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-secondary rounded-lg px-3 h-8 w-40">
                <Search size={14} className="text-muted-foreground mr-1.5" />
                <input type="text" placeholder="Search..." className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none w-full" />
              </div>
              <select className="text-xs bg-secondary border border-border rounded px-2 py-1 text-foreground">
                <option>Sort by Date</option>
              </select>
            </div>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-background">
                {["Date", "Time", "Type", "Material", "Supplier", "Status"].map((h) => (
                  <th key={h} className="text-xs uppercase text-muted-foreground font-semibold tracking-wider text-left px-3 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {movementData.map((m, i) => (
                <tr key={i} className="h-11 border-t border-border hover:bg-primary/5 transition-colors">
                  <td className="px-3 text-sm text-foreground">{m.date}</td>
                  <td className="px-3 text-sm text-muted-foreground">{m.time}</td>
                  <td className="px-3">
                    <span className={`text-[11px] font-semibold px-[6px] py-[3px] rounded-[999px] ${typeColors[m.type]}`}>{m.type}</span>
                  </td>
                  <td className="px-3 text-sm text-foreground">{m.material}</td>
                  <td className="px-3 text-sm text-foreground">{m.supplier}</td>
                  <td className="px-3">
                    <span className={`text-[11px] font-semibold px-[6px] py-[3px] rounded-[999px] ${statusColors[m.status]}`}>{m.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 overflow-x-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-foreground">Stock Search & Tracking</h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-secondary rounded-lg px-3 h-8 w-40">
                <Search size={14} className="text-muted-foreground mr-1.5" />
                <input type="text" placeholder="Search..." className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none w-full" />
              </div>
              <select className="text-xs bg-secondary border border-border rounded px-2 py-1 text-foreground">
                <option>Sort by Fill %</option>
              </select>
            </div>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-background">
                {["Factory", "Material", "Stock (kg)", "Capacity", "Fill %", "Updated", "Status"].map((h) => (
                  <th key={h} className="text-xs uppercase text-muted-foreground font-semibold tracking-wider text-left px-3 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stockTracking.map((s: any, i) => {
                const fill = Math.round(parseFloat(s.fill_percent || 0));
                const stock = parseFloat(s.weight_kg || 0);
                const capacity = 5000;
                return (
                <tr key={i} className="h-11 border-t border-border hover:bg-primary/5 transition-colors">
                  <td className="px-3 text-sm text-foreground">{s.factory_id}</td>
                  <td className="px-3 text-sm text-foreground">{s.material_type}</td>
                  <td className="px-3 text-sm text-foreground">{stock.toLocaleString()}</td>
                  <td className="px-3 text-sm text-muted-foreground">{capacity.toLocaleString()}</td>
                  <td className="px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${fill > 40 ? "bg-success" : fill >= 20 ? "bg-warning" : "bg-destructive"}`} style={{ width: `${fill}%` }} />
                      </div>
                      <span className="text-xs font-medium">{fill}%</span>
                    </div>
                  </td>
                  <td className="px-3 text-xs text-muted-foreground">{s.time ? formatDistanceToNow(new Date(s.time), { addSuffix: true }) : '-'}</td>
                  <td className="px-3">
                    <span className={`text-[11px] font-semibold px-[6px] py-[3px] rounded-[999px] ${fill > 40 ? statusColors.Good : statusColors.Low}`}>{fill > 40 ? 'Good' : 'Low'}</span>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
