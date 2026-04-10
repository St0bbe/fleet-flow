import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Vehicle, Driver, ChecklistItem, Mission, UserRole } from '@/types/fleet';

interface AppState {
  role: UserRole;
  setRole: (role: UserRole) => void;
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
}

const AppContext = createContext<AppState | null>(null);

const sampleVehicles: Vehicle[] = [
  { id: '1', model: 'Toyota Hilux', plate: 'ABC-1234', color: 'Branco', year: 2023, status: 'available' },
  { id: '2', model: 'Fiat Toro', plate: 'DEF-5678', color: 'Prata', year: 2022, status: 'onroute' },
  { id: '3', model: 'VW Amarok', plate: 'GHI-9012', color: 'Preto', year: 2024, status: 'available' },
  { id: '4', model: 'Chevrolet S10', plate: 'JKL-3456', color: 'Vermelho', year: 2021, status: 'maintenance' },
];

const sampleDrivers: Driver[] = [
  { id: '1', name: 'Carlos Silva', email: 'carlos@empresa.com', phone: '(11) 99999-0001' },
  { id: '2', name: 'Ana Souza', email: 'ana@empresa.com', phone: '(11) 99999-0002' },
  { id: '3', name: 'Pedro Lima', email: 'pedro@empresa.com', phone: '(11) 99999-0003' },
];

const sampleChecklist: ChecklistItem[] = [
  { id: '1', question: 'Higienização interna OK?', type: 'boolean' },
  { id: '2', question: 'Nível de combustível', type: 'text' },
  { id: '3', question: 'Estepe em bom estado?', type: 'boolean' },
  { id: '4', question: 'Chave de roda e triângulo OK?', type: 'boolean' },
  { id: '5', question: 'Faróis e lanternas funcionando?', type: 'boolean' },
  { id: '6', question: 'Pneus em bom estado?', type: 'boolean' },
];

const sampleMissions: Mission[] = [
  {
    id: '1',
    driverId: '1',
    driverName: 'Carlos Silva',
    vehicleId: '2',
    vehiclePlate: 'DEF-5678',
    vehicleModel: 'Fiat Toro',
    objective: 'Entrega de materiais para obra no centro',
    pickupLocation: 'Garagem Central',
    returnLocation: 'Garagem Central',
    startDate: '2026-04-08T08:00:00',
    endDate: '2026-04-08T17:30:00',
    odometerStart: 45230,
    odometerEnd: 45312,
    checklistIn: [
      { itemId: '1', question: 'Higienização interna OK?', answer: true },
      { itemId: '2', question: 'Nível de combustível', answer: '3/4' },
    ],
    checklistOut: [
      { itemId: '1', question: 'Higienização interna OK?', answer: true },
      { itemId: '2', question: 'Nível de combustível', answer: '1/2' },
    ],
    photosIn: [],
    photosOut: [],
    notesIn: 'Veículo em bom estado',
    notesOut: 'Pequeno arranhão no para-choque traseiro',
    route: [[-23.5505, -46.6333], [-23.5615, -46.6558], [-23.5731, -46.6420]],
    status: 'completed',
  },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>('admin');
  const [vehicles, setVehicles] = useState<Vehicle[]>(sampleVehicles);
  const [drivers, setDrivers] = useState<Driver[]>(sampleDrivers);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(sampleChecklist);
  const [missions, setMissions] = useState<Mission[]>(sampleMissions);
  const [activeMission, setActiveMission] = useState<Mission | null>(null);

  return (
    <AppContext.Provider value={{
      role, setRole,
      vehicles, setVehicles,
      drivers, setDrivers,
      checklistItems, setChecklistItems,
      missions, setMissions,
      activeMission, setActiveMission,
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
