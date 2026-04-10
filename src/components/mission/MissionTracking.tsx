import { useEffect, useState, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { TransferMission } from './TransferMission';

interface Props {
  onFinish: () => void;
}

export function MissionTracking({ onFinish }: Props) {
  const { activeMission, setActiveMission } = useApp();
  const { user, driverRecord } = useAuth();
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [tracking, setTracking] = useState(true);
  const routeRef = useRef<[number, number][]>(activeMission?.route || []);
  const [missionType, setMissionType] = useState<string>('standard');

  // Fetch mission type
  useEffect(() => {
    if (!activeMission) return;
    supabase.from('missions').select('mission_type').eq('id', activeMission.id).single()
      .then(({ data }) => {
        if (data) setMissionType((data as any).mission_type || 'standard');
      });
  }, [activeMission?.id]);

  useEffect(() => {
    if (!tracking) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setPosition(coords);
        routeRef.current = [...routeRef.current, coords];
        if (activeMission) {
          setActiveMission((prev) => prev ? { ...prev, route: routeRef.current } : prev);
        }
        // Save route periodically
        if (activeMission && routeRef.current.length % 5 === 0) {
          supabase.from('missions')
            .update({ route: routeRef.current as any })
            .eq('id', activeMission.id)
            .then();
        }
        // Update driver location
        if (user && driverRecord) {
          supabase.from('driver_locations').upsert({
            driver_id: driverRecord.id,
            user_id: user.id,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            last_updated: new Date().toISOString(),
          }, { onConflict: 'driver_id' }).then();
        }
      },
      (err) => console.warn('Geolocation error:', err),
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [tracking]);

  useEffect(() => {
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleFinish = async () => {
    setTracking(false);
    if (activeMission) {
      await supabase.from('missions')
        .update({ route: routeRef.current as any })
        .eq('id', activeMission.id);
    }
    onFinish();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8">
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center"
      >
        <div className="w-16 h-16 rounded-full bg-success/30 flex items-center justify-center">
          <Navigation className="w-8 h-8 text-success" />
        </div>
      </motion.div>

      <div className="text-center space-y-2">
        <h1 className="text-2xl font-heading font-bold">Missão em Andamento</h1>
        <p className="text-muted-foreground">{activeMission?.objective}</p>
      </div>

      <div className="glass-card rounded-xl p-6 w-full max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" /> Tempo em rota
          </span>
          <span className="font-mono font-bold text-lg">{formatTime(elapsed)}</span>
        </div>
        {position && (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" /> Localização
            </span>
            <span className="font-mono text-sm">
              {position[0].toFixed(4)}, {position[1].toFixed(4)}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Navigation className="w-4 h-4" /> Pontos rastreados
          </span>
          <span className="font-mono font-bold">{routeRef.current.length}</span>
        </div>
      </div>

      {/* Transfer stages */}
      {missionType === 'transfer' && activeMission && (
        <div className="w-full max-w-md">
          <TransferMission missionId={activeMission.id} isOwner={true} />
        </div>
      )}

      <Button
        size="lg"
        variant="destructive"
        className="text-lg px-10 py-6 rounded-xl"
        onClick={handleFinish}
      >
        Finalizar Missão
      </Button>
    </div>
  );
}
