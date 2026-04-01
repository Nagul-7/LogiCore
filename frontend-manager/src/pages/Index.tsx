import KpiCards from "@/components/dashboard/KpiCards";
import LiveMapSection from "@/components/dashboard/LiveMapSection";
import ActiveTripsTable from "@/components/dashboard/ActiveTripsTable";
import ExceptionAlerts from "@/components/dashboard/ExceptionAlerts";
import useData from '../hooks/useData';

export default function Index() {
  useData();
  
  return (
    <div className="space-y-6">
      <KpiCards />
      <LiveMapSection />
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">
        <ActiveTripsTable />
        <ExceptionAlerts />
      </div>
    </div>
  );
}
