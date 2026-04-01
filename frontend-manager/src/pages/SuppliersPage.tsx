import { useState, useEffect } from "react";
import { Plus, Star } from "lucide-react";
import useAppStore from "@/store/useAppStore";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={14}
          className={s <= Math.round(rating) ? "text-warning fill-warning" : "text-border"}
        />
      ))}
      <span className="text-xs font-medium text-foreground ml-1">{rating}</span>
    </div>
  );
}

export default function SuppliersPage() {
  const store = useAppStore();
  const [localSuppliers, setLocalSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const base = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
    fetch(`${base}/api/v1/suppliers`)
      .then(r => r.json())
      .then(data => {
        setLocalSuppliers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Suppliers fetch error:', err);
        setLoading(false);
      });
  }, []);

  const suppliers = store.suppliers.length > 0 ? store.suppliers : localSuppliers;

  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  const avgRating = suppliers.length > 0 
    ? (suppliers.reduce((acc, s: any) => acc + parseFloat(s.rating || 0), 0) / suppliers.length).toFixed(1)
    : "0.0";

  const summaryCards = [
    { label: "Total Suppliers", value: suppliers.length.toString() },
    { label: "Active Pickups", value: suppliers.reduce((acc, s: any) => acc + parseInt(s.pending_pickups || 0), 0).toString() },
    { label: "Avg Rating", value: avgRating, showStars: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Suppliers</h2>
        <button className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 h-10 rounded-lg text-sm font-medium">
          <Plus size={16} /> Add Supplier
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {summaryCards.map((c) => (
          <div key={c.label} className="bg-card border border-border rounded-xl p-6">
            <p className="text-sm text-muted-foreground">{c.label}</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-2xl font-bold text-foreground">{c.value}</p>
              {c.showStars && (
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={14} className={s <= 5 ? "text-warning fill-warning" : "text-border"} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-6 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-background">
              {["Supplier", "Materials", "Rating", "Active Pickups", "Status", "Actions"].map((h) => (
                <th key={h} className="text-xs uppercase text-muted-foreground font-semibold tracking-wider text-left px-3 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">Loading...</td></tr>
            ) : suppliers.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">No suppliers found</td></tr>
            ) : (
              suppliers.map((s: any) => {
                const materials = Array.isArray(s.material_types) ? s.material_types : s.material_types ? [s.material_types] : [];
                return (
                <tr key={s.id} className="h-14 border-t border-border hover:bg-primary/5 transition-colors">
                  <td className="px-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold shrink-0">
                        {getInitials(s.name)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.contact_phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3">
                    <div className="flex flex-wrap gap-1">
                      {materials.map((m: any) => (
                        <span key={m} className="text-[11px] font-semibold px-[6px] py-[3px] rounded-[999px] bg-secondary text-foreground">{m}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3"><Stars rating={parseFloat(s.rating || 0)} /></td>
                  <td className="px-3">
                    <span className="text-[11px] font-semibold px-[6px] py-[3px] rounded-[999px] bg-primary/10 text-primary">{s.pending_pickups}</span>
                  </td>
                  <td className="px-3">
                    <span className={`text-[11px] font-semibold px-[6px] py-[3px] rounded-[999px] bg-success/10 text-success`}>
                      Online
                    </span>
                  </td>
                  <td className="px-3">
                    <button className="text-sm text-primary hover:underline">View</button>
                  </td>
                </tr>
              )})
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
