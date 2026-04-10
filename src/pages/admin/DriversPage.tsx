import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Driver } from '@/types/fleet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, User } from 'lucide-react';
import { toast } from 'sonner';

export default function DriversPage() {
  const { drivers, setDrivers } = useApp();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });

  const handleAdd = () => {
    if (!form.name || !form.email) {
      toast.error('Preencha nome e email');
      return;
    }
    const newDriver: Driver = { id: Date.now().toString(), ...form };
    setDrivers((prev) => [...prev, newDriver]);
    setForm({ name: '', email: '', phone: '' });
    setOpen(false);
    toast.success('Motorista adicionado');
  };

  const handleRemove = (id: string) => {
    setDrivers((prev) => prev.filter((d) => d.id !== id));
    toast.success('Motorista removido');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold">Gestão de Equipe</h1>
          <p className="text-muted-foreground mt-1">{drivers.length} motoristas</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Novo Motorista</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Adicionar Motorista</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div><Label>Nome</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label>Telefone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <Button onClick={handleAdd} className="w-full">Adicionar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {drivers.map((d) => (
          <div key={d.id} className="glass-card rounded-xl p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{d.name}</h3>
                  <p className="text-sm text-muted-foreground">{d.email}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleRemove(d.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            {d.phone && <p className="text-sm text-muted-foreground mt-3">{d.phone}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
