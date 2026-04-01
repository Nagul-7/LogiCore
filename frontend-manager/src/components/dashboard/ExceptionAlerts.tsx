import { AlertCircle, Package, Clock, CheckCircle } from "lucide-react";
import useAppStore from "@/store/useAppStore";
import { formatDistanceToNow } from "date-fns";

export default function ExceptionAlerts() {
  const { alerts, dismissAlert } = useAppStore();

  const getAlertProps = (alert: any) => {
    switch (alert.severity) {
      case "critical":
        return {
          icon: AlertCircle,
          iconColor: "text-destructive",
          borderColor: "border-l-destructive",
        };
      case "warning":
        return {
          icon: alert.type === "inventory" ? Package : Clock,
          iconColor: "text-warning",
          borderColor: "border-l-warning",
        };
      case "info":
        return {
          icon: CheckCircle,
          iconColor: "text-primary",
          borderColor: "border-l-primary",
        };
      default:
        return {
          icon: AlertCircle,
          iconColor: "text-muted-foreground",
          borderColor: "border-l-border",
        };
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-foreground">Exception Alerts</h2>
        <span className="text-sm font-medium text-destructive">{alerts.length} active</span>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {alerts.length === 0 ? (
          <p className="text-sm text-muted-foreground italic text-center py-4">No active alerts</p>
        ) : (
          alerts.map((a) => {
            const props = getAlertProps(a);
            const Icon = props.icon;
            return (
              <div key={a.id} className={`border-l-4 ${props.borderColor} bg-secondary/50 rounded-lg p-4`}>
                <div className="flex items-start gap-3">
                  <Icon size={18} className={`${props.iconColor} mt-0.5 shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {a.type === "exception" ? "Trip Exception" : a.type === "inventory" ? "Inventory Alert" : "Alert"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.message}</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">{formatDistanceToNow(a.id, { addSuffix: true })}</p>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => dismissAlert(a.id)}
                        className="text-xs px-3 py-1.5 rounded-md font-medium bg-muted text-muted-foreground hover:bg-muted/80"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
