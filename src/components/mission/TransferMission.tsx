import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Check, MapPin, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Stage {
  id?: string;
  position: number;
  origin: string;
  destination: string;
  eta: string;
  arrival_time?: string;
  departure_time?: string;
  receptive: string;
  status: 'pending' | 'in_progress' | 'completed';
  notes: string;
}

interface Props {
  missionId: string;
  isOwner: boolean;
}

export function TransferMission({ missionId, isOwner }: Props) {
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newStage, setNewStage] = useState<Partial<Stage>>({
    origin: '', destination: '', eta: '', receptive: '', notes: '',
  });

  const fetchStages = async () => {
    const { data } = await supabase
      .from('mission_stages')
      .select('*')
      .eq('mission_id', missionId)
      .order('position');
    if (data) {
      setStages(data.map(s => ({
        id: s.id,
        position: s.position,
        origin: s.origin,
        destination: s.destination,
        eta: s.eta || '',
        arrival_time: s.arrival_time || undefined,
        departure_time: s.departure_time || undefined,
        receptive: s.receptive || '',
        status: s.status as any,
        notes: s.notes || '',
      })));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStages();
    const channel = supabase
      .channel(`stages-${missionId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mission_stages', filter: `mission_id=eq.${missionId}` }, () => {
        fetchStages();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [missionId]);

  const addStage = async () => {
    if (!newStage.origin || !newStage.destination) {
      toast.error('Preencha origem e destino');
      return;
    }
    const { error } = await supabase.from('mission_stages').insert({
      mission_id: missionId,
      position: stages.length,
      origin: newStage.origin,
      destination: newStage.destination,
      eta: newStage.eta || null,
      receptive: newStage.receptive || null,
      notes: newStage.notes || null,
      status: 'pending',
    });
    if (error) {
      toast.error('Erro ao adicionar etapa');
      return;
    }
    setNewStage({ origin: '', destination: '', eta: '', receptive: '', notes: '' });
    setAdding(false);
    toast.success('Etapa adicionada!');
  };

  const updateStageStatus = async (stageId: string, status: string) => {
    const updates: any = { status };
    if (status === 'in_progress') {
      updates.departure_time = new Date().toISOString();
    }
    if (status === 'completed') {
      updates.arrival_time = new Date().toISOString();
    }
    await supabase.from('mission_stages').update(updates).eq('id', stageId);
    toast.success(status === 'completed' ? 'Etapa concluída!' : 'Etapa iniciada!');
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  const statusColor = (s: string) => {
    if (s === 'completed') return 'bg-success/20 text-success';
    if (s === 'in_progress') return 'bg-warning/20 text-warning';
    return 'bg-muted text-muted-foreground';
  };

  const statusLabel = (s: string) => {
    if (s === 'completed') return 'Concluída';
    if (s === 'in_progress') return 'Em Andamento';
    return 'Pendente';
  };

  return (
    <div className="space-y-4">
      <h3 className="font-heading font-semibold flex items-center gap-2">
        <MapPin className="w-5 h-5 text-primary" /> Etapas do Transfer
      </h3>

      {stages.length === 0 && !adding && (
        <p className="text-sm text-muted-foreground">Nenhuma etapa adicionada ainda.</p>
      )}

      <div className="space-y-3">
        {stages.map((stage, idx) => (
          <div key={stage.id} className="glass-card rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-heading font-semibold text-sm">Etapa {idx + 1}</span>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor(stage.status)}`}>
                {statusLabel(stage.status)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <span>{stage.origin}</span>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <span>{stage.destination}</span>
            </div>
            {stage.eta && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" /> Previsão: {format(new Date(stage.eta), "dd/MM HH:mm", { locale: ptBR })}
              </div>
            )}
            {stage.receptive && (
              <p className="text-xs text-muted-foreground">Receptivo: {stage.receptive}</p>
            )}
            {stage.arrival_time && (
              <p className="text-xs text-success">Chegou: {format(new Date(stage.arrival_time), "dd/MM HH:mm", { locale: ptBR })}</p>
            )}
            {stage.notes && <p className="text-xs text-muted-foreground">{stage.notes}</p>}

            {isOwner && stage.status === 'pending' && (
              <Button size="sm" variant="outline" onClick={() => updateStageStatus(stage.id!, 'in_progress')}>
                Iniciar Etapa
              </Button>
            )}
            {isOwner && stage.status === 'in_progress' && (
              <Button size="sm" onClick={() => updateStageStatus(stage.id!, 'completed')}>
                <Check className="w-3 h-3 mr-1" /> Concluir Etapa
              </Button>
            )}
          </div>
        ))}
      </div>

      {isOwner && !adding && (
        <Button variant="outline" onClick={() => setAdding(true)} className="w-full">
          <Plus className="w-4 h-4 mr-2" /> Adicionar Etapa
        </Button>
      )}

      {adding && (
        <div className="glass-card rounded-xl p-4 space-y-3">
          <h4 className="font-heading font-semibold text-sm">Nova Etapa</h4>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Origem *</Label><Input value={newStage.origin} onChange={e => setNewStage({ ...newStage, origin: e.target.value })} placeholder="Local X" /></div>
            <div><Label>Destino *</Label><Input value={newStage.destination} onChange={e => setNewStage({ ...newStage, destination: e.target.value })} placeholder="Local Y" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Previsão de Chegada</Label><Input type="datetime-local" value={newStage.eta} onChange={e => setNewStage({ ...newStage, eta: e.target.value })} /></div>
            <div><Label>Receptivo</Label><Input value={newStage.receptive} onChange={e => setNewStage({ ...newStage, receptive: e.target.value })} placeholder="Nome do receptivo" /></div>
          </div>
          <div><Label>Observações</Label><Textarea value={newStage.notes} onChange={e => setNewStage({ ...newStage, notes: e.target.value })} rows={2} /></div>
          <div className="flex gap-2">
            <Button onClick={addStage} className="flex-1">Salvar Etapa</Button>
            <Button variant="ghost" onClick={() => setAdding(false)}>Cancelar</Button>
          </div>
        </div>
      )}
    </div>
  );
}
