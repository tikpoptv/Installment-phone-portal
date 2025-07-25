import { createContext } from 'react';

export interface MaintenanceContextType {
  isMaintenanceMode: boolean;
  loading: boolean;
}

export const MaintenanceContext = createContext<MaintenanceContextType | undefined>(undefined); 