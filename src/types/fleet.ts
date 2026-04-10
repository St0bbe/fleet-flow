export type VehicleStatus = 'available' | 'onroute' | 'maintenance';
export type UserRole = 'admin' | 'driver';

export interface Vehicle {
  id: string;
  model: string;
  plate: string;
  color: string;
  year: number;
  photo?: string;
  status: VehicleStatus;
}

export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
}

export interface ChecklistItem {
  id: string;
  question: string;
  type: 'boolean' | 'text' | 'number';
}

export interface ChecklistAnswer {
  itemId: string;
  question: string;
  answer: string | boolean | number;
}

export interface Mission {
  id: string;
  driverId: string;
  driverName: string;
  vehicleId: string;
  vehiclePlate: string;
  vehicleModel: string;
  objective: string;
  pickupLocation: string;
  returnLocation?: string;
  startDate: string;
  endDate?: string;
  odometerStart: number;
  odometerEnd?: number;
  checklistIn: ChecklistAnswer[];
  checklistOut?: ChecklistAnswer[];
  photosIn: string[];
  photosOut?: string[];
  notesIn: string;
  notesOut?: string;
  route: [number, number][];
  status: 'active' | 'completed';
}
