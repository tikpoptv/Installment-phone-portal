import React from 'react';
import styles from './MaintenancePage.module.css';
import { useMaintenance } from '../hooks/useMaintenance';

const MaintenancePage: React.FC = () => {
  const { estimatedCompletionTime } = useMaintenance();

  return (
    <div className={styles.maintenanceContainer}>
      <div className={styles.maintenanceContent}>
        <div className={styles.maintenanceIcon}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path fillRule="evenodd" d="M12 6.75a5.25 5.25 0 016.975-5.025.75.75 0 01.985.985 5.25 5.25 0 01-5.025 6.975.75.75 0 01-.985-.985A5.25 5.25 0 0112 6.75zM12 15.75a5.25 5.25 0 01-6.975 5.025.75.75 0 01-.985-.985 5.25 5.25 0 015.025-6.975.75.75 0 01.985.985A5.25 5.25 0 0112 15.75zM12 12a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3A.75.75 0 0112 12zM12 9a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3A.75.75 0 0112 9z" clipRule="evenodd" />
          </svg>
        </div>
        <h1 className={styles.maintenanceTitle}>ระบบกำลังซ่อมบำรุง</h1>
        <p className={styles.maintenanceMessage}>
          ขออภัย ระบบกำลังอยู่ในระหว่างการซ่อมบำรุงเพื่อปรับปรุงการให้บริการ
          <br />
          กรุณาลองใหม่อีกครั้งในภายหลัง
        </p>
        <div className={styles.maintenanceInfo}>
          <p>⏰ เวลาที่คาดว่าจะเสร็จสิ้น: {estimatedCompletionTime || 'เร็วๆนี้'}</p>
          <p>📧 ติดต่อสอบถาม: support@phitik.com</p>
        </div>
        <button 
          className={styles.retryButton}
          onClick={() => window.location.reload()}
        >
          ลองใหม่อีกครั้ง
        </button>
      </div>
    </div>
  );
};

export default MaintenancePage; 