import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSystemSettings } from '../services/system-setting.service';
import { useLocation } from 'react-router-dom';

interface MaintenanceContextType {
  isMaintenanceMode: boolean;
  loading: boolean;
}

const MaintenanceContext = createContext<MaintenanceContextType | undefined>(undefined);

export const useMaintenance = () => {
  const context = useContext(MaintenanceContext);
  if (context === undefined) {
    throw new Error('useMaintenance must be used within a MaintenanceProvider');
  }
  return context;
};

export const MaintenanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // เช็ค bypass maintenance mode จาก environment variable (เฉพาะ development)
  const BYPASS_MAINTENANCE = import.meta.env.DEV && import.meta.env.VITE_BYPASS_MAINTENANCE === 'true';

  useEffect(() => {
    const checkMaintenanceMode = async () => {
      // ถ้า bypass maintenance mode ให้ไม่แสดง maintenance page
      if (BYPASS_MAINTENANCE) {
        setIsMaintenanceMode(false);
        setLoading(false);
        return;
      }

      try {
        const settings = await getSystemSettings();
        const maintenanceSetting = settings.find(setting => setting.key === 'PortalMaintenance');
        
        if (maintenanceSetting && maintenanceSetting.value === 'true') {
          setIsMaintenanceMode(true);
        } else {
          setIsMaintenanceMode(false);
        }
      } catch (error) {
        console.error('Failed to check maintenance mode:', error);
        // ถ้าไม่สามารถเช็คได้ ให้ไม่แสดง maintenance mode
        setIsMaintenanceMode(false);
      } finally {
        setLoading(false);
      }
    };

    checkMaintenanceMode();

  }, [location.pathname, BYPASS_MAINTENANCE]); // เช็คทุกครั้งที่ path เปลี่ยน

  return (
    <MaintenanceContext.Provider value={{ isMaintenanceMode, loading }}>
      {children}
    </MaintenanceContext.Provider>
  );
}; 