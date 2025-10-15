import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, AlertCircle, Shield } from 'lucide-react';

export interface Violation {
  type: string;
  confidence: number;
  description: string;
  location: string;
  severity: 'low' | 'medium' | 'high';
}

interface ViolationDisplayProps {
  violations: Violation[];
}

const violationConfig = {
  HELMET_VIOLATION: {
    label: 'Helmet Violation',
    color: 'warning',
    icon: AlertTriangle,
  },
  RED_LIGHT_VIOLATION: {
    label: 'Red Light Violation',
    color: 'destructive',
    icon: AlertCircle,
  },
  SPEED_VIOLATION: {
    label: 'Speed Violation',
    color: 'warning',
    icon: AlertTriangle,
  },
  LANE_VIOLATION: {
    label: 'Lane Violation',
    color: 'warning',
    icon: AlertTriangle,
  },
  WRONG_WAY: {
    label: 'Wrong Way Driving',
    color: 'destructive',
    icon: AlertCircle,
  },
};

export const ViolationDisplay = ({ violations }: ViolationDisplayProps) => {
  if (violations.length === 0) {
    return (
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center gap-3 text-success">
          <Shield className="h-6 w-6" />
          <div>
            <h3 className="text-lg font-semibold">No Violations Detected</h3>
            <p className="text-sm text-muted-foreground">All traffic rules appear to be followed</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">
        Detected Violations ({violations.length})
      </h3>
      
      {violations.map((violation, index) => {
        const config = violationConfig[violation.type as keyof typeof violationConfig];
        const Icon = config?.icon || AlertCircle;
        
        return (
          <Card 
            key={index} 
            className={`p-4 bg-card border-border ${
              violation.severity === 'high' ? 'border-destructive/50 shadow-danger' :
              violation.severity === 'medium' ? 'border-warning/50 shadow-warning' :
              'border-border'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${
                violation.severity === 'high' ? 'bg-destructive/10 text-destructive' :
                violation.severity === 'medium' ? 'bg-warning/10 text-warning' :
                'bg-primary/10 text-primary'
              }`}>
                <Icon className="h-5 w-5" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-foreground">
                    {config?.label || violation.type}
                  </h4>
                  <Badge variant={violation.severity === 'high' ? 'destructive' : 'secondary'}>
                    {Math.round(violation.confidence * 100)}% confident
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">
                  {violation.description}
                </p>
                
                <div className="flex gap-2 text-xs">
                  <Badge variant="outline" className="bg-secondary/50">
                    {violation.location}
                  </Badge>
                  <Badge 
                    variant="outline"
                    className={
                      violation.severity === 'high' ? 'bg-destructive/10 text-destructive border-destructive/50' :
                      violation.severity === 'medium' ? 'bg-warning/10 text-warning border-warning/50' :
                      'bg-success/10 text-success border-success/50'
                    }
                  >
                    {violation.severity.toUpperCase()} SEVERITY
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
