import { useApp } from '@/contexts/AppContext';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Car, Route, Wrench, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { vehicles, missions } = useApp();

  const available = vehicles.filter((v) => v.status === 'available').length;
  const onRoute = vehicles.filter((v) => v.status === 'onroute').length;
  const inMaintenance = vehicles.filter((v) => v.status === 'maintenance').length;
  const completedMissions = missions.filter((m) => m.status === 'completed').length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-heading font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visão geral da frota</p>
      </div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <StatCard title="Disponíveis" value={available} icon={Car} variant="success" />
        <StatCard title="Em Rota" value={onRoute} icon={Route} variant="accent" />
        <StatCard title="Manutenção" value={inMaintenance} icon={Wrench} variant="warning" />
        <StatCard title="Missões Concluídas" value={completedMissions} icon={CheckCircle} variant="default" />
      </motion.div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="text-lg font-heading font-semibold">Veículos da Frota</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Modelo</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Placa</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Cor</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Ano</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5 font-medium">{v.model}</td>
                  <td className="px-5 py-3.5 font-mono text-xs">{v.plate}</td>
                  <td className="px-5 py-3.5">{v.color}</td>
                  <td className="px-5 py-3.5">{v.year}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={v.status} /></td>
                </tr>
              ))}
              {vehicles.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum veículo cadastrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
