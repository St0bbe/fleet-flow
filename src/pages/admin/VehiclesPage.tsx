import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { VehicleStatus } from '@/types/fleet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function VehiclesPage() {
  const { vehicles, refreshData } = useApp();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ model: '', plate: '', color: '', year: '', status: 'available' as VehicleStatus });

  const resetForm = () => {
    setForm({ model: '', plate: '', color: '', year: '', status: 'available' });
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!form.model || !form.plate) {
      toast.error('Preencha modelo e placa');
      return;
    }
    if (editingId) {
      const { error } = await supabase.from('vehicles').update({
        model: form.model, plate: form.plate, color: form.color,
        year: Number(form.year), status: form.status,
      }).eq('id', editingId);
      if (error) { toast.error('Erro ao atualizar'); return; }
      toast.success('Veículo atualizado');
    } else {
      const { error } = await supabase.from('vehicles').insert({
        model: form.model, plate: form.plate, color: form.color,
        year: Number(form.year), status: form.status,
      });
      if (error) { toast.error('Erro ao adicionar'); return; }
      toast.success('Veículo adicionado');
    }
    resetForm();
    setOpen(false);
    await refreshData();
  };

  const handleEdit = (v: typeof vehicles[0]) => {
    setForm({ model: v.model, plate: v.plate, color: v.color, year: String(v.year), status: v.status });
    setEditingId(v.id);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('vehicles').delete().eq('id', id);
    if (error) { toast.error('Erro ao remover'); return; }
    toast.success('Veículo removido');
    await refreshData();
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
              <DialogTitle>{editingId ? 'Editar Veículo' : 'Adicionar Veículo'}</DialogTitle>
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
              <Button onClick={handleSave} className="w-full">{editingId ? 'Salvar Alterações' : 'Adicionar'}</Button>
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
              <span>{v.color}</span><span>•</span><span>{v.year}</span>
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
