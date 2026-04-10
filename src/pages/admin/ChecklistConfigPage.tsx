import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { ChecklistItem } from '@/types/fleet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

export default function ChecklistConfigPage() {
  const { checklistItems, setChecklistItems } = useApp();
  const [newQuestion, setNewQuestion] = useState('');
  const [newType, setNewType] = useState<'boolean' | 'text' | 'number'>('boolean');

  const handleAdd = () => {
    if (!newQuestion.trim()) {
      toast.error('Digite uma pergunta');
      return;
    }
    const item: ChecklistItem = {
      id: Date.now().toString(),
      question: newQuestion.trim(),
      type: newType,
    };
    setChecklistItems((prev) => [...prev, item]);
    setNewQuestion('');
    toast.success('Item adicionado');
  };

  const handleRemove = (id: string) => {
    setChecklistItems((prev) => prev.filter((i) => i.id !== id));
    toast.success('Item removido');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-heading font-bold">Configuração do Checklist</h1>
        <p className="text-muted-foreground mt-1">Defina as perguntas do checklist de retirada e devolução</p>
      </div>

      {/* Add new */}
      <div className="glass-card rounded-xl p-5">
        <h2 className="font-heading font-semibold mb-4">Novo Item</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            className="flex-1"
            placeholder="Ex: Higienização interna OK?"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <Select value={newType} onValueChange={(v) => setNewType(v as typeof newType)}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="boolean">Sim/Não</SelectItem>
              <SelectItem value="text">Texto</SelectItem>
              <SelectItem value="number">Número</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAdd}><Plus className="w-4 h-4 mr-2" /> Adicionar</Button>
        </div>
      </div>

      {/* List */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="font-heading font-semibold">{checklistItems.length} itens no checklist</h2>
        </div>
        <div className="divide-y divide-border/50">
          {checklistItems.map((item, idx) => (
            <div key={item.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors">
              <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm font-medium text-muted-foreground w-6">{idx + 1}.</span>
              <span className="flex-1">{item.question}</span>
              <span className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">
                {item.type === 'boolean' ? 'Sim/Não' : item.type === 'text' ? 'Texto' : 'Número'}
              </span>
              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleRemove(item.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
