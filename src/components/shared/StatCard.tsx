import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'accent' | 'warning' | 'destructive';
}

const variantStyles = {
  default: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  accent: 'bg-accent/10 text-accent',
  warning: 'bg-warning/10 text-warning',
  destructive: 'bg-destructive/10 text-destructive',
};

export function StatCard({ title, value, icon: Icon, variant = 'default' }: StatCardProps) {
  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-heading font-bold mt-1">{value}</p>
        </div>
        <div className={cn('p-2.5 rounded-lg', variantStyles[variant])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
