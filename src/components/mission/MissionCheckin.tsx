import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { ChecklistAnswer, Mission } from '@/types/fleet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowRight, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  onComplete: () => void;
}

export function MissionCheckin({ onComplete }: Props) {
  const { vehicles, checklistItems, setActiveMission, refreshData } = useApp();
  const { driverRecord } = useAuth();
  const availableVehicles = vehicles.filter((v) => v.status === 'available');

  const [vehicleId, setVehicleId] = useState('');
  const [objective, setObjective] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [odometerStart, setOdometerStart] = useState('');
  const [notes, setNotes] = useState('');
  const [answers, setAnswers] = useState<Record<string, string | boolean>>({});
  const [step, setStep] = useState<'info' | 'checklist' | 'photos'>('info');

  const handleInfoNext = () => {
    if (!vehicleId || !objective || !pickupLocation || !odometerStart) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    setStep('checklist');
  };

  const handleChecklistNext = () => {
    setStep('photos');
  };

  const handleFinish = async () => {
    if (!driverRecord) {
      toast.error('Erro: motorista não identificado');
      return;
    }

    const vehicle = vehicles.find((v) => v.id === vehicleId)!;
    const checklistAnswers: ChecklistAnswer[] = checklistItems.map((item) => ({
      itemId: item.id,
      question: item.question,
      answer: answers[item.id] ?? (item.type === 'boolean' ? false : ''),
    }));

    // Insert mission into Supabase
    const { data: missionData, error } = await supabase.from('missions').insert({
      driver_id: driverRecord.id,
      vehicle_id: vehicleId,
      objective,
      pickup_location: pickupLocation,
      odometer_start: Number(odometerStart),
      checklist_in: checklistAnswers as any,
      notes_in: notes,
      route: [],
      status: 'active',
    }).select().single();

    if (error) {
      toast.error('Erro ao criar missão: ' + error.message);
      return;
    }

    // Update vehicle status
    await supabase.from('vehicles').update({ status: 'onroute' }).eq('id', vehicleId);

    const mission: Mission = {
      id: missionData.id,
      driverId: driverRecord.id,
      driverName: driverRecord.name,
      vehicleId,
      vehiclePlate: vehicle.plate,
      vehicleModel: vehicle.model,
      objective,
      pickupLocation,
      startDate: missionData.start_date,
      odometerStart: Number(odometerStart),
      checklistIn: checklistAnswers,
      photosIn: [],
      notesIn: notes,
      route: [],
      status: 'active',
    };

    setActiveMission(mission);
    await refreshData();
    toast.success('Missão iniciada!');
    onComplete();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Check-in — Retirada</h1>
        <div className="flex items-center gap-2 mt-3">
          {['info', 'checklist', 'photos'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step === s ? 'bg-primary text-primary-foreground' :
                ['info', 'checklist', 'photos'].indexOf(step) > i ? 'bg-success text-success-foreground' :
                'bg-muted text-muted-foreground'
              }`}>
                {i + 1}
              </div>
              {i < 2 && <div className="w-8 h-0.5 bg-border" />}
            </div>
          ))}
        </div>
      </div>

      {step === 'info' && (
        <div className="glass-card rounded-xl p-6 space-y-4">
          <div>
            <Label>Veículo *</Label>
            <Select value={vehicleId} onValueChange={setVehicleId}>
              <SelectTrigger><SelectValue placeholder="Selecione um veículo" /></SelectTrigger>
              <SelectContent>
                {availableVehicles.map((v) => (
                  <SelectItem key={v.id} value={v.id}>{v.model} — {v.plate}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div><Label>Objetivo da Viagem *</Label><Input value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="Descreva o objetivo" /></div>
          <div><Label>Local de Retirada *</Label><Input value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)} placeholder="Garagem Central" /></div>
          <div><Label>Quilometragem (Hodômetro) *</Label><Input type="number" value={odometerStart} onChange={(e) => setOdometerStart(e.target.value)} placeholder="45230" /></div>
          <Button onClick={handleInfoNext} className="w-full">Próximo <ArrowRight className="w-4 h-4 ml-2" /></Button>
        </div>
      )}

      {step === 'checklist' && (
        <div className="glass-card rounded-xl p-6 space-y-4">
          <h2 className="font-heading font-semibold">Checklist de Retirada</h2>
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
                  placeholder={item.type === 'number' ? '0' : 'Resposta'}
                  type={item.type === 'number' ? 'number' : 'text'}
                />
              )}
            </div>
          ))}
          <Button onClick={handleChecklistNext} className="w-full">Próximo <ArrowRight className="w-4 h-4 ml-2" /></Button>
        </div>
      )}

      {step === 'photos' && (
        <div className="glass-card rounded-xl p-6 space-y-4">
          <h2 className="font-heading font-semibold">Fotos e Observações</h2>
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
            <Camera className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">Tire fotos do veículo na retirada</p>
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
            <Label>Observações / Avarias</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Descreva o estado do veículo, avarias existentes..." rows={4} />
          </div>
          <Button onClick={handleFinish} className="w-full" size="lg">
            Iniciar Rota <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
