import { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  onFinish: () => void;
}

export function MissionTracking({ onFinish }: Props) {
  const { activeMission, setActiveMission } = useApp();
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [tracking, setTracking] = useState(true);

  useEffect(() => {
    if (!tracking) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setPosition(coords);
        if (activeMission) {
          setActiveMission((prev) => prev ? { ...prev, route: [...prev.route, coords] } : prev);
        }
      },
      (err) => console.warn('Geolocation error:', err),
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [tracking, activeMission, setActiveMission]);

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
          <span className="font-mono font-bold">{activeMission?.route.length || 0}</span>
        </div>
      </div>

      <Button
        size="lg"
        variant="destructive"
        className="text-lg px-10 py-6 rounded-xl"
        onClick={() => {
          setTracking(false);
          onFinish();
        }}
      >
        Finalizar Missão
      </Button>
    </div>
  );
}
