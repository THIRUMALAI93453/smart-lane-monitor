import { Card } from '@/components/ui/card';
import { Activity, AlertTriangle, Shield, TrendingUp } from 'lucide-react';

interface DashboardProps {
  totalAnalyses: number;
  totalViolations: number;
  recentViolations: Array<{ type: string; timestamp: Date }>;
}

export const Dashboard = ({ totalAnalyses, totalViolations, recentViolations }: DashboardProps) => {
  const violationRate = totalAnalyses > 0 
    ? Math.round((totalViolations / totalAnalyses) * 100) 
    : 0;

  const stats = [
    {
      label: 'Total Analyses',
      value: totalAnalyses,
      icon: Activity,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Violations Found',
      value: totalViolations,
      icon: AlertTriangle,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      label: 'Violation Rate',
      value: `${violationRate}%`,
      icon: TrendingUp,
      color: totalViolations === 0 ? 'text-success' : 'text-warning',
      bgColor: totalViolations === 0 ? 'bg-success/10' : 'bg-warning/10',
    },
    {
      label: 'Clean Frames',
      value: totalAnalyses - totalViolations,
      icon: Shield,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Analytics Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-4 bg-card border-border">
              <div className="flex items-center gap-3 w-full">
                <div className={`p-3 rounded-lg ${stat.bgColor} flex-shrink-0`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="flex flex-col justify-center min-w-0 flex-1">
                  <p className="text-sm text-muted-foreground leading-none mb-1.5">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground leading-none">{stat.value}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {recentViolations.length > 0 && (
        <Card className="p-6 bg-card border-border">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Recent Violations</h3>
          <div className="space-y-2">
            {recentViolations.slice(0, 5).map((violation, index) => (
              <div 
                key={index}
                className="flex items-center justify-between py-2 border-b border-border last:border-0 gap-4"
              >
                <span className="text-sm font-medium text-foreground capitalize">
                  {violation.type.replace(/_/g, ' ')}
                </span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(violation.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
