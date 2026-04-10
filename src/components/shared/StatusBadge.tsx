import { cn } from '@/lib/utils';
import { VehicleStatus } from '@/types/fleet';

const statusConfig: Record<VehicleStatus, { label: string; className: string }> = {
  available: { label: 'Disponível', className: 'status-available' },
  onroute: { label: 'Em Rota', className: 'status-onroute' },
  maintenance: { label: 'Manutenção', className: 'status-maintenance' },
};

export function StatusBadge({ status }: { status: VehicleStatus }) {
  const config = statusConfig[status];
  return (
    <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold', config.className)}>
      <span className={cn('w-1.5 h-1.5 rounded-full mr-1.5', {
        'bg-success': status === 'available',
        'bg-accent': status === 'onroute',
        'bg-warning': status === 'maintenance',
      })} />
      {config.label}
    </span>
  );
}
