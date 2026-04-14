import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { MobileBottomNav } from './MobileBottomNav';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      {/* Mobile bottom nav */}
      <MobileBottomNav />

      <main className="md:ml-16 lg:ml-60 min-h-screen transition-all duration-300 pb-20 md:pb-0">
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
