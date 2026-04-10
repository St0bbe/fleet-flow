import { Mission } from '@/types/fleet';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MissionDetailProps {
  mission: Mission;
  onBack: () => void;
}

export function MissionDetail({ mission, onBack }: MissionDetailProps) {
  const handleExportPDF = () => {
    // Placeholder - will implement PDF generation
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-heading font-bold">{mission.objective}</h1>
          <p className="text-muted-foreground">Missão #{mission.id}</p>
        </div>
        <Button variant="outline" onClick={handleExportPDF}>
          <Download className="w-4 h-4 mr-2" /> Exportar PDF
        </Button>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card rounded-xl p-5 space-y-3">
          <h3 className="font-heading font-semibold">Dados da Viagem</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Motorista</span><span className="font-medium">{mission.driverName}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Veículo</span><span className="font-medium">{mission.vehicleModel} ({mission.vehiclePlate})</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Início</span><span className="font-medium">{format(new Date(mission.startDate), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span></div>
            {mission.endDate && <div className="flex justify-between"><span className="text-muted-foreground">Término</span><span className="font-medium">{format(new Date(mission.endDate), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span></div>}
            <div className="flex justify-between"><span className="text-muted-foreground">Km Inicial</span><span className="font-medium">{mission.odometerStart.toLocaleString()}</span></div>
            {mission.odometerEnd && <div className="flex justify-between"><span className="text-muted-foreground">Km Final</span><span className="font-medium">{mission.odometerEnd.toLocaleString()}</span></div>}
            {mission.odometerEnd && <div className="flex justify-between"><span className="text-muted-foreground">Distância</span><span className="font-medium font-heading">{(mission.odometerEnd - mission.odometerStart).toLocaleString()} km</span></div>}
          </div>
        </div>

        <div className="glass-card rounded-xl p-5 space-y-3">
          <h3 className="font-heading font-semibold">Locais</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Retirada</span><span className="font-medium">{mission.pickupLocation}</span></div>
            {mission.returnLocation && <div className="flex justify-between"><span className="text-muted-foreground">Devolução</span><span className="font-medium">{mission.returnLocation}</span></div>}
          </div>
          {mission.notesIn && (
            <div className="mt-3 pt-3 border-t border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Observações (retirada)</p>
              <p className="text-sm">{mission.notesIn}</p>
            </div>
          )}
          {mission.notesOut && (
            <div className="mt-3 pt-3 border-t border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Avarias (devolução)</p>
              <p className="text-sm text-destructive">{mission.notesOut}</p>
            </div>
          )}
        </div>
      </div>

      {/* Checklists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mission.checklistIn.length > 0 && (
          <div className="glass-card rounded-xl p-5">
            <h3 className="font-heading font-semibold mb-3">Checklist de Retirada</h3>
            <div className="space-y-2">
              {mission.checklistIn.map((c) => (
                <div key={c.itemId} className="flex items-center gap-2 text-sm">
                  {c.answer === true ? (
                    <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                  ) : c.answer === false ? (
                    <XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                  ) : null}
                  <span className="flex-1">{c.question}</span>
                  {typeof c.answer === 'string' && <span className="font-medium">{c.answer}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
        {mission.checklistOut && mission.checklistOut.length > 0 && (
          <div className="glass-card rounded-xl p-5">
            <h3 className="font-heading font-semibold mb-3">Checklist de Devolução</h3>
            <div className="space-y-2">
              {mission.checklistOut.map((c) => (
                <div key={c.itemId} className="flex items-center gap-2 text-sm">
                  {c.answer === true ? (
                    <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                  ) : c.answer === false ? (
                    <XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                  ) : null}
                  <span className="flex-1">{c.question}</span>
                  {typeof c.answer === 'string' && <span className="font-medium">{c.answer}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
