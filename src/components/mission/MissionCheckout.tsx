import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { ChecklistAnswer } from '@/types/fleet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Camera, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  onComplete: () => void;
}

export function MissionCheckout({ onComplete }: Props) {
  const { activeMission, setActiveMission, setMissions, setVehicles, checklistItems } = useApp();
  const [odometerEnd, setOdometerEnd] = useState('');
  const [returnLocation, setReturnLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [answers, setAnswers] = useState<Record<string, string | boolean>>({});
  const [step, setStep] = useState<'info' | 'checklist' | 'photos'>('info');

  const handleFinish = () => {
    if (!odometerEnd || !returnLocation) {
      toast.error('Preencha km final e local de devolução');
      return;
    }

    const checklistAnswers: ChecklistAnswer[] = checklistItems.map((item) => ({
      itemId: item.id,
      question: item.question,
      answer: answers[item.id] ?? (item.type === 'boolean' ? false : ''),
    }));

    if (activeMission) {
      const updated = {
        ...activeMission,
        odometerEnd: Number(odometerEnd),
        returnLocation,
        endDate: new Date().toISOString(),
        checklistOut: checklistAnswers,
        notesOut: notes,
        photosOut: [],
        status: 'completed' as const,
      };

      setMissions((prev) => prev.map((m) => m.id === activeMission.id ? updated : m));
      setVehicles((prev) => prev.map((v) => v.id === activeMission.vehicleId ? { ...v, status: 'available' as const } : v));
      setActiveMission(null);
    }

    toast.success('Missão concluída com sucesso!');
    onComplete();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Check-out — Devolução</h1>
        <p className="text-muted-foreground mt-1">{activeMission?.objective}</p>
      </div>

      {step === 'info' && (
        <div className="glass-card rounded-xl p-6 space-y-4">
          <div><Label>Quilometragem Final *</Label><Input type="number" value={odometerEnd} onChange={(e) => setOdometerEnd(e.target.value)} placeholder="45312" /></div>
          <div><Label>Local de Devolução *</Label><Input value={returnLocation} onChange={(e) => setReturnLocation(e.target.value)} placeholder="Garagem Central" /></div>
          <Button onClick={() => setStep('checklist')} className="w-full">Próximo</Button>
        </div>
      )}

      {step === 'checklist' && (
        <div className="glass-card rounded-xl p-6 space-y-4">
          <h2 className="font-heading font-semibold">Checklist de Devolução</h2>
          {checklistItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
              <span className="text-sm flex-1">{item.question}</span>
              {item.type === 'boolean' ? (
                <Switch
                  checked={!!answers[item.id]}
                  onCheckedChange={(checked) => setAnswers({ ...answers, [item.id]: checked })}
                />
              ) : (
                <Input
                  className="w-32 ml-4"
                  value={(answers[item.id] as string) || ''}
                  onChange={(e) => setAnswers({ ...answers, [item.id]: e.target.value })}
                  type={item.type === 'number' ? 'number' : 'text'}
                />
              )}
            </div>
          ))}
          <Button onClick={() => setStep('photos')} className="w-full">Próximo</Button>
        </div>
      )}

      {step === 'photos' && (
        <div className="glass-card rounded-xl p-6 space-y-4">
          <h2 className="font-heading font-semibold">Fotos e Avarias</h2>
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
            <Camera className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">Tire fotos do veículo na devolução</p>
            <Button variant="outline" className="mt-3" onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.capture = 'environment';
              input.multiple = true;
              input.click();
            }}>
              <Camera className="w-4 h-4 mr-2" /> Abrir Câmera
            </Button>
          </div>
          <div>
            <Label>Observações / Novas Avarias</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Registre novas avarias ou observações..." rows={4} />
          </div>
          <Button onClick={handleFinish} className="w-full" size="lg">
            <CheckCircle className="w-5 h-5 mr-2" /> Concluir Missão
          </Button>
        </div>
      )}
    </div>
  );
}
