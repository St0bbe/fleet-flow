import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { MissionCheckin } from '@/components/mission/MissionCheckin';
import { MissionTracking } from '@/components/mission/MissionTracking';
import { MissionCheckout } from '@/components/mission/MissionCheckout';
import { Button } from '@/components/ui/button';
import { MapPin, Truck } from 'lucide-react';
import { motion } from 'framer-motion';

type MissionStep = 'idle' | 'checkin' | 'tracking' | 'checkout';

export default function MissionPage() {
  const { activeMission } = useApp();
  const [step, setStep] = useState<MissionStep>(activeMission ? 'tracking' : 'idle');

  if (step === 'checkin') {
    return <MissionCheckin onComplete={() => setStep('tracking')} />;
  }

  if (step === 'tracking') {
    return <MissionTracking onFinish={() => setStep('checkout')} />;
  }

  if (step === 'checkout') {
    return <MissionCheckout onComplete={() => setStep('idle')} />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4"
      >
        <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
          <Truck className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-2xl md:text-3xl font-heading font-bold">Pronto para a Missão?</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Inicie uma nova missão para registrar a retirada do veículo, acompanhar sua rota e registrar a devolução.
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <Button size="lg" className="text-lg px-8 py-6 rounded-xl" onClick={() => setStep('checkin')}>
          <MapPin className="w-5 h-5 mr-2" /> Iniciar Nova Missão
        </Button>
      </motion.div>
    </div>
  );
}
