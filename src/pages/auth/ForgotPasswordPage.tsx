import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Informe seu email');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast.error('Erro ao enviar email: ' + error.message);
    } else {
      setSent(true);
      toast.success('Email de recuperação enviado!');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary flex items-center justify-center">
            <Mail className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-heading font-bold">Recuperar Senha</h1>
          <p className="text-muted-foreground text-sm">
            Informe seu email para receber o link de recuperação.
          </p>
        </div>

        {sent ? (
          <div className="glass-card rounded-xl p-6 text-center space-y-4">
            <p className="text-sm">
              Se o email estiver cadastrado, você receberá um link de recuperação.
              Verifique sua caixa de entrada e spam.
            </p>
            <Link to="/login">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Login
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-card rounded-xl p-6 space-y-4">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                autoComplete="email"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
              Enviar Link
            </Button>
            <Link to="/login" className="block text-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-3 h-3 inline mr-1" /> Voltar ao Login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
