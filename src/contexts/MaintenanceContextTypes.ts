import { createContext } from 'react';

export interface MaintenanceContextType {
  isMaintenanceMode: boolean;
  loading: boolean;
  estimatedCompletionTime?: string;
}

export const MaintenanceContext = createContext<MaintenanceContextType | undefined>(undefined); 