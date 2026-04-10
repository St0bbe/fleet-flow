import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, User, Copy, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function DriversPage() {
  const { drivers, refreshData } = useApp();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!form.name || !form.email) {
      toast.error('Preencha nome e email');
      return;
    }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke('create-driver', {
        body: form,
      });

      if (res.error) {
        toast.error('Erro: ' + (res.error.message || 'Falha ao criar motorista'));
        setLoading(false);
        return;
      }

      const result = res.data;
      if (result.error) {
        toast.error('Erro: ' + result.error);
        setLoading(false);
        return;
      }

      setTempPassword(result.temporaryPassword);
      toast.success('Motorista criado com sucesso!');
      await refreshData();
    } catch (err: any) {
      toast.error('Erro ao criar motorista');
    }
    setLoading(false);
  };

  const handleRemove = async (id: string) => {
    const { error } = await supabase.from('drivers').delete().eq('id', id);
    if (error) {
      toast.error('Erro ao remover motorista');
      return;
    }
    toast.success('Motorista removido');
    await refreshData();
  };

  const copyPassword = () => {
    if (tempPassword) {
      navigator.clipboard.writeText(tempPassword);
      toast.success('Senha copiada!');
    }
  };

  const closeDialog = () => {
    setOpen(false);
    setForm({ name: '', email: '', phone: '' });
    setTempPassword(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold">Gestão de Equipe</h1>
          <p className="text-muted-foreground mt-1">{drivers.length} motoristas</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { if (!o) closeDialog(); else setOpen(true); }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Novo Motorista</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{tempPassword ? 'Motorista Criado!' : 'Adicionar Motorista'}</DialogTitle></DialogHeader>
            {tempPassword ? (
              <div className="space-y-4 mt-4">
                <p className="text-sm text-muted-foreground">
                  O motorista foi criado com sucesso. Compartilhe a senha temporária abaixo. 
                  No primeiro acesso, ele será solicitado a alterar a senha.
                </p>
                <div className="glass-card rounded-lg p-4 space-y-2">
                  <div className="text-sm"><span className="text-muted-foreground">Email:</span> <span className="font-medium">{form.email}</span></div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Senha:</span>
                    <code className="font-mono text-sm bg-muted px-2 py-1 rounded">{tempPassword}</code>
                    <Button variant="ghost" size="icon" onClick={copyPassword}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Button onClick={closeDialog} className="w-full">Fechar</Button>
              </div>
            ) : (
              <div className="space-y-4 mt-4">
                <div><Label>Nome</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                <div><Label>Telefone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                <Button onClick={handleAdd} className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Adicionar
                </Button>
              </div>
            )}
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
