import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardLayout from "@/components/DashboardLayout";
import Index from "./pages/Index";
import TripsPage from "./pages/TripsPage";
import DriversPage from "./pages/DriversPage";
import SuppliersPage from "./pages/SuppliersPage";
import InventoryPage from "./pages/InventoryPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {[
            { path: "/", element: <Index /> },
            { path: "/trips", element: <TripsPage /> },
            { path: "/drivers", element: <DriversPage /> },
            { path: "/suppliers", element: <SuppliersPage /> },
            { path: "/inventory", element: <InventoryPage /> },
            { path: "/reports", element: <ReportsPage /> },
            { path: "/settings", element: <SettingsPage /> },
          ].map(({ path, element }) => (
            <Route key={path} path={path} element={<DashboardLayout>{element}</DashboardLayout>} />
          ))}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
