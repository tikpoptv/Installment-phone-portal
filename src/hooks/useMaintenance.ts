import { useContext } from 'react';
import { MaintenanceContext } from '../contexts/MaintenanceContextTypes';

export const useMaintenance = () => {
  const context = useContext(MaintenanceContext);
  if (context === undefined) {
    throw new Error('useMaintenance must be used within a MaintenanceProvider');
  }
  return context;
}; 