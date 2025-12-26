import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon: LucideIcon;
  color?: "primary" | "accent" | "emerald" | "orange";
}

export function StatCard({ label, value, trend, trendUp, icon: Icon, color = "primary" }: StatCardProps) {
  const colorStyles = {
    primary: "bg-blue-50 text-blue-600",
    accent: "bg-purple-50 text-purple-600",
    emerald: "bg-emerald-50 text-emerald-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="premium-card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <h3 className="text-2xl font-bold mt-2 text-foreground font-display">{value}</h3>
          {trend && (
            <p className={`text-xs mt-2 font-medium flex items-center gap-1 ${trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
              {trendUp ? '↑' : '↓'} {trend}
              <span className="text-muted-foreground font-normal ml-1">vs last month</span>
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorStyles[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
