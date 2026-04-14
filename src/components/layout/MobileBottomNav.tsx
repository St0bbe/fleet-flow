import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Car,
  Users,
  ClipboardCheck,
  History,
  MapPin,
  Map,
  LogOut,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';

const adminLinks = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/vehicles', label: 'Frota', icon: Car },
  { to: '/drivers', label: 'Equipe', icon: Users },
  { to: '/checklist-config', label: 'Checklist', icon: ClipboardCheck },
  { to: '/drivers-map', label: 'Mapa', icon: Map },
  { to: '/history', label: 'Histórico', icon: History },
];

const driverLinks = [
  { to: '/mission', label: 'Missão', icon: MapPin },
  { to: '/drivers-map', label: 'Mapa', icon: Map },
  { to: '/history', label: 'Histórico', icon: History },
];

export function MobileBottomNav() {
  const { role } = useApp();
  const { signOut, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);

  const allLinks = role === 'admin' ? adminLinks : driverLinks;
  // Show max 4 items in bottom bar, rest go to "more" sheet
  const maxVisible = 4;
  const visibleLinks = allLinks.slice(0, maxVisible);
  const overflowLinks = allLinks.slice(maxVisible);
  const hasMore = overflowLinks.length > 0 || true; // always show "more" for logout access

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-sidebar border-t border-sidebar-border md:hidden">
        <div className="flex items-center justify-around h-16 px-1">
          {visibleLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <button
                key={link.to}
                onClick={() => navigate(link.to)}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-colors',
                  isActive
                    ? 'text-sidebar-primary'
                    : 'text-sidebar-foreground/70'
                )}
              >
                <link.icon className={cn('w-5 h-5', isActive && 'text-sidebar-primary')} />
                <span>{link.label}</span>
              </button>
            );
          })}
          {hasOverflow && (
            <button
              onClick={() => setMoreOpen(true)}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-colors',
                overflowLinks.some(l => location.pathname === l.to)
                  ? 'text-sidebar-primary'
                  : 'text-sidebar-foreground/70'
              )}
            >
              <MoreHorizontal className="w-5 h-5" />
              <span>Mais</span>
            </button>
          )}
        </div>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="bg-sidebar text-sidebar-foreground border-sidebar-border rounded-t-2xl">
          <SheetHeader className="pb-2">
            <SheetTitle className="text-sidebar-primary-foreground">Menu</SheetTitle>
            <SheetDescription className="text-sidebar-foreground/70">
              {user?.email}
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-1 py-2">
            {overflowLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <button
                  key={link.to}
                  onClick={() => { navigate(link.to); setMoreOpen(false); }}
                  className={cn(
                    'flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-primary'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                  )}
                >
                  <link.icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </button>
              );
            })}
            <button
              onClick={async () => { await signOut(); navigate('/'); }}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-sidebar-accent/50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sair</span>
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
