import { useState } from "react";
import { Settings, Building2, Truck, Users, Bell } from "lucide-react";

const navItems = [
  { label: "General", icon: Settings },
  { label: "Factories", icon: Building2 },
  { label: "Trucks", icon: Truck },
  { label: "Users", icon: Users },
  { label: "Notifications", icon: Bell },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("General");
  const [systemName, setSystemName] = useState("LogiCore");
  const [bufferTime, setBufferTime] = useState(45);
  const [threshold, setThreshold] = useState(20);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
      <div className="bg-card border border-border rounded-xl p-4 space-y-1 h-fit">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => setActiveTab(item.label)}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-colors ${
              activeTab === item.label
                ? "bg-primary text-primary-foreground font-medium"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        <h2 className="text-lg font-semibold text-foreground">{activeTab} Settings</h2>

        <div className="space-y-5 max-w-md">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">System Name</label>
            <input
              type="text"
              value={systemName}
              onChange={(e) => setSystemName(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              Default Buffer Time: <span className="text-primary">{bufferTime} min</span>
            </label>
            <input
              type="range"
              min={0}
              max={120}
              value={bufferTime}
              onChange={(e) => setBufferTime(Number(e.target.value))}
              className="w-full accent-primary"
              style={{ accentColor: "hsl(224 76% 48%)" }}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0 min</span>
              <span>120 min</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              Low Stock Alert Threshold: <span className="text-primary">{threshold}%</span>
            </label>
            <input
              type="range"
              min={5}
              max={50}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full"
              style={{ accentColor: "hsl(224 76% 48%)" }}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>5%</span>
              <span>50%</span>
            </div>
          </div>

          <button className="bg-primary text-primary-foreground px-6 h-10 rounded-lg text-sm font-medium">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
