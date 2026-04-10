import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Vehicle, Driver, ChecklistItem, Mission, UserRole } from '@/types/fleet';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface AppState {
  role: UserRole;
  vehicles: Vehicle[];
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
  drivers: Driver[];
  setDrivers: React.Dispatch<React.SetStateAction<Driver[]>>;
  checklistItems: ChecklistItem[];
  setChecklistItems: React.Dispatch<React.SetStateAction<ChecklistItem[]>>;
  missions: Mission[];
  setMissions: React.Dispatch<React.SetStateAction<Mission[]>>;
  activeMission: Mission | null;
  setActiveMission: React.Dispatch<React.SetStateAction<Mission | null>>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { role: authRole, driverRecord } = useAuth();
  const role: UserRole = authRole || 'driver';

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [activeMission, setActiveMission] = useState<Mission | null>(null);

  const refreshData = async () => {
    // Load vehicles
    const { data: vData } = await supabase.from('vehicles').select('*').order('created_at');
    if (vData) {
      setVehicles(vData.map(v => ({
        id: v.id,
        model: v.model,
        plate: v.plate,
        color: v.color,
        year: v.year,
        photo: v.photo || undefined,
        status: v.status as any,
      })));
    }

    // Load drivers
    const { data: dData } = await supabase.from('drivers').select('*').order('created_at');
    if (dData) {
      setDrivers(dData.map(d => ({
        id: d.id,
        name: d.name,
        email: d.email,
        phone: d.phone || '',
        avatar: d.avatar || undefined,
      })));
    }

    // Load checklist items
    const { data: cData } = await supabase.from('checklist_items').select('*').order('position');
    if (cData) {
      setChecklistItems(cData.map(c => ({
        id: c.id,
        question: c.question,
        type: c.type as any,
      })));
    }

    // Load missions
    const { data: mData } = await supabase
      .from('missions')
      .select('*, driver:drivers(name), vehicle:vehicles(plate, model)')
      .order('created_at', { ascending: false });
    if (mData) {
      setMissions(mData.map(m => ({
        id: m.id,
        driverId: m.driver_id,
        driverName: (m.driver as any)?.name || '',
        vehicleId: m.vehicle_id,
        vehiclePlate: (m.vehicle as any)?.plate || '',
        vehicleModel: (m.vehicle as any)?.model || '',
        objective: m.objective,
        pickupLocation: m.pickup_location,
        returnLocation: m.return_location || undefined,
        startDate: m.start_date,
        endDate: m.end_date || undefined,
        odometerStart: m.odometer_start,
        odometerEnd: m.odometer_end || undefined,
        checklistIn: (m.checklist_in as any[]) || [],
        checklistOut: (m.checklist_out as any[]) || undefined,
        photosIn: m.photos_in || [],
        photosOut: m.photos_out || undefined,
        notesIn: m.notes_in || '',
        notesOut: m.notes_out || undefined,
        route: (m.route as any[]) || [],
        status: m.status as any,
      })));

      // Check for active mission for current driver
      if (driverRecord) {
        const active = mData.find(m => m.driver_id === driverRecord.id && m.status === 'active');
        if (active) {
          setActiveMission({
            id: active.id,
            driverId: active.driver_id,
            driverName: (active.driver as any)?.name || '',
            vehicleId: active.vehicle_id,
            vehiclePlate: (active.vehicle as any)?.plate || '',
            vehicleModel: (active.vehicle as any)?.model || '',
            objective: active.objective,
            pickupLocation: active.pickup_location,
            returnLocation: active.return_location || undefined,
            startDate: active.start_date,
            endDate: active.end_date || undefined,
            odometerStart: active.odometer_start,
            odometerEnd: active.odometer_end || undefined,
            checklistIn: (active.checklist_in as any[]) || [],
            checklistOut: (active.checklist_out as any[]) || undefined,
            photosIn: active.photos_in || [],
            photosOut: active.photos_out || undefined,
            notesIn: active.notes_in || '',
            notesOut: active.notes_out || undefined,
            route: (active.route as any[]) || [],
            status: active.status as any,
          });
        }
      }
    }
  };

  useEffect(() => {
    refreshData();
  }, [authRole, driverRecord]);

  return (
    <AppContext.Provider value={{
      role,
      vehicles, setVehicles,
      drivers, setDrivers,
      checklistItems, setChecklistItems,
      missions, setMissions,
      activeMission, setActiveMission,
      refreshData,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
