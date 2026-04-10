import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppProvider, useApp } from "@/contexts/AppContext";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "@/pages/admin/Dashboard";
import VehiclesPage from "@/pages/admin/VehiclesPage";
import DriversPage from "@/pages/admin/DriversPage";
import ChecklistConfigPage from "@/pages/admin/ChecklistConfigPage";
import HistoryPage from "@/pages/admin/HistoryPage";
import MissionPage from "@/pages/driver/MissionPage";
import LoginPage from "@/pages/auth/LoginPage";
import ChangePasswordPage from "@/pages/auth/ChangePasswordPage";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function AuthGate() {
  const { user, loading, mustChangePassword } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <LoginPage />;
  if (mustChangePassword) return <ChangePasswordPage />;

  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}

function AppRoutes() {
  const { role } = useApp();

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={role === 'admin' ? <Dashboard /> : <MissionPage />} />
        <Route path="/vehicles" element={<VehiclesPage />} />
        <Route path="/drivers" element={<DriversPage />} />
        <Route path="/checklist-config" element={<ChecklistConfigPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/mission" element={<MissionPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AuthGate />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
