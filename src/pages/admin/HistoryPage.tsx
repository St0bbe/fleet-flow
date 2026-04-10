import { useApp } from '@/contexts/AppContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MapPin, Calendar, User, Car, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { MissionDetail } from '@/components/mission/MissionDetail';
import { Mission } from '@/types/fleet';

export default function HistoryPage() {
  const { missions } = useApp();
  const [selected, setSelected] = useState<Mission | null>(null);

  const completedMissions = missions.filter((m) => m.status === 'completed');

  if (selected) {
    return <MissionDetail mission={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-heading font-bold">Histórico de Missões</h1>
        <p className="text-muted-foreground mt-1">{completedMissions.length} missões concluídas</p>
      </div>

      <div className="space-y-4">
        {completedMissions.map((m) => (
          <div key={m.id} className="glass-card rounded-xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <h3 className="font-heading font-semibold">{m.objective}</h3>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {m.driverName}</span>
                  <span className="flex items-center gap-1"><Car className="w-3.5 h-3.5" /> {m.vehicleModel} ({m.vehiclePlate})</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {format(new Date(m.startDate), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {m.odometerEnd ? m.odometerEnd - m.odometerStart : '—'} km
                  </span>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelected(m)}>
                <Eye className="w-4 h-4 mr-1" /> Detalhes
              </Button>
            </div>
          </div>
        ))}
        {completedMissions.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            Nenhuma missão concluída ainda.
          </div>
        )}
      </div>
    </div>
  );
}
