import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  Truck,
  Users,
  Building2,
  Package,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  badge?: string;
  badgeColor?: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: BarChart3, path: "/" },
  { label: "Trips", icon: Truck, path: "/trips", badge: "12", badgeColor: "bg-accent" },
  { label: "Drivers", icon: Users, path: "/drivers", badge: "4 online", badgeColor: "bg-accent" },
  { label: "Suppliers", icon: Building2, path: "/suppliers" },
  { label: "Inventory", icon: Package, path: "/inventory", badge: "3 alerts", badgeColor: "bg-destructive" },
  { label: "Reports", icon: FileText, path: "/reports" },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function AppSidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: AppSidebarProps) {
  const location = useLocation();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border shrink-0">
        <Truck className="text-accent shrink-0" size={24} />
        {!collapsed && <span className="ml-3 text-lg font-bold text-sidebar-foreground">LogiCore</span>}
        <button
          onClick={onToggle}
          className="ml-auto text-sidebar-muted hover:text-sidebar-foreground hidden lg:flex items-center justify-center"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onMobileClose}
              className={`flex items-center h-11 mx-2 px-3 gap-3 rounded-lg transition-colors ${
                active
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground"
              }`}
            >
              <item.icon size={20} className="shrink-0" />
              {!collapsed && (
                <>
                  <span className="text-sm flex-1">{item.label}</span>
                  {item.badge && (
                    <span className={`text-xs px-2 py-0.5 rounded-full text-white ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="mt-auto border-t border-sidebar-border p-4 space-y-3">
        <Link
          to="/settings"
          onClick={onMobileClose}
          className={`flex items-center gap-3 transition-colors ${
            location.pathname === "/settings"
              ? "text-accent font-medium"
              : "text-sidebar-muted hover:text-sidebar-foreground"
          }`}
        >
          <Settings size={20} className="shrink-0" />
          {!collapsed && <span className="text-sm">Settings</span>}
        </Link>

        <div className="border-t border-sidebar-border pt-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-accent-foreground text-sm font-semibold shrink-0">
            PM
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">Priya Manager</p>
              <p className="text-xs text-sidebar-muted truncate">Factory Manager</p>
            </div>
          )}
          {!collapsed && (
            <button className="text-sidebar-muted hover:text-sidebar-foreground shrink-0">
              <LogOut size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed top-0 left-0 h-screen z-30 transition-all duration-200 ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={onMobileClose} />
          <aside className="relative w-60 h-full">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
