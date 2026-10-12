export type Role = 'DRIVER' | 'FLEET_MANAGER' | 'FINANCE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
}

export type VehicleStatus = 'ACTIVE' | 'IN_MAINTENANCE' | 'INACTIVE';

export interface Vehicle {
  id: string;
  plate: string;
  model: string;
  brand: string;
  year: number;
  currentKm: number;
  status: VehicleStatus;
}

export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiration: string;
  phone: string;
  active: boolean;
}

export type MaintenanceType = 'OIL_CHANGE' | 'INSPECTION' | 'TIRE_REPLACEMENT';

export interface Maintenance {
  id: string;
  vehicleId: string;
  type: MaintenanceType;
  registeredKm: number;
  performedAt: string;
  nextDueKm: number;
  nextDueDate: string;
}

export type DocumentType = 'CRLV' | 'INSURANCE' | 'LICENSING';

export interface VehicleDocument {
  id: string;
  vehicleId: string;
  type: DocumentType;
  issuedAt: string;
  expiresAt: string;
}

export interface Fuel {
  id: string;
  vehicleId: string;
  refueledAt: string;
  liters: number;
  totalCost: number;
  odometerKm: number;
  consumptionKmL: number | null;
  anomalousConsumption: boolean | null;
}
