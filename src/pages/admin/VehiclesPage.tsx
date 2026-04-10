import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Vehicle, VehicleStatus } from '@/types/fleet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function VehiclesPage() {
  const { vehicles, setVehicles } = useApp();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [form, setForm] = useState({ model: '', plate: '', color: '', year: '', status: 'available' as VehicleStatus });

  const resetForm = () => {
    setForm({ model: '', plate: '', color: '', year: '', status: 'available' });
    setEditing(null);
  };

  const handleSave = () => {
    if (!form.model || !form.plate) {
      toast.error('Preencha modelo e placa');
      return;
    }
    if (editing) {
      setVehicles((prev) =>
        prev.map((v) => (v.id === editing.id ? { ...v, ...form, year: Number(form.year) } : v))
      );
      toast.success('Veículo atualizado');
    } else {
      const newVehicle: Vehicle = {
        id: Date.now().toString(),
        ...form,
        year: Number(form.year),
      };
      setVehicles((prev) => [...prev, newVehicle]);
      toast.success('Veículo adicionado');
    }
    resetForm();
    setOpen(false);
  };

  const handleEdit = (v: Vehicle) => {
    setForm({ model: v.model, plate: v.plate, color: v.color, year: String(v.year), status: v.status });
    setEditing(v);
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    setVehicles((prev) => prev.filter((v) => v.id !== id));
    toast.success('Veículo removido');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold">Gestão de Frota</h1>
          <p className="text-muted-foreground mt-1">{vehicles.length} veículos cadastrados</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Novo Veículo</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? 'Editar Veículo' : 'Adicionar Veículo'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div><Label>Modelo</Label><Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="Toyota Hilux" /></div>
              <div><Label>Placa</Label><Input value={form.plate} onChange={(e) => setForm({ ...form, plate: e.target.value })} placeholder="ABC-1234" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Cor</Label><Input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} placeholder="Branco" /></div>
                <div><Label>Ano</Label><Input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="2024" /></div>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as VehicleStatus })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Disponível</SelectItem>
                    <SelectItem value="onroute">Em Rota</SelectItem>
                    <SelectItem value="maintenance">Manutenção</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSave} className="w-full">{editing ? 'Salvar Alterações' : 'Adicionar'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <motion.div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {vehicles.map((v) => (
          <div key={v.id} className="glass-card rounded-xl p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-heading font-semibold text-lg">{v.model}</h3>
                <p className="font-mono text-sm text-muted-foreground">{v.plate}</p>
              </div>
              <StatusBadge status={v.status} />
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{v.color}</span>
              <span>•</span>
              <span>{v.year}</span>
            </div>
            <div className="flex gap-2 pt-2 border-t border-border/50">
              <Button variant="outline" size="sm" onClick={() => handleEdit(v)}>
                <Pencil className="w-3.5 h-3.5 mr-1" /> Editar
              </Button>
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(v.id)}>
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Remover
              </Button>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
