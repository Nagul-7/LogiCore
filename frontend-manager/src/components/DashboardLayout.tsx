import { useState } from "react";
import { useLocation } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import TopBar from "./TopBar";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/trips": "Trips",
  "/drivers": "Drivers",
  "/suppliers": "Suppliers",
  "/inventory": "Inventory",
  "/reports": "Reports",
  "/settings": "Settings",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const title = pageTitles[location.pathname] || "Dashboard";

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className={`transition-all duration-200 ${collapsed ? "lg:ml-16" : "lg:ml-60"}`}>
        <TopBar title={title} onMenuClick={() => setMobileOpen(true)} />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
