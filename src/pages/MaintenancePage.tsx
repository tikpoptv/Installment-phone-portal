import React, { useState, useEffect } from 'react';
import styles from './MaintenancePage.module.css';
import { useMaintenance } from '../hooks/useMaintenance';

const MaintenancePage: React.FC = () => {
  const { estimatedCompletionTime } = useMaintenance();
  const [currentGifIndex, setCurrentGifIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  
  // รายการ GIF ที่จะสลับ (เพิ่มไฟล์ใหม่ทั้งหมด)
  const gifList = [
    '/gif/1ed2f24a0444ee7a3f59f6aaa5f9d092.gif',
    '/gif/45fa006df254a8e567151c27ade0b31e.gif',
    '/gif/fc504576b225dddb40e38ba7c05a5bf4.gif',
    '/gif/001d2f18b6d27dbd36191d66064bef6f.gif',
    '/gif/a4cd4d37d90e1185047d4bc59e0ce52d.gif'
  ];

  useEffect(() => {
    // สลับ GIF ทุก 3 วินาที
    const interval = setInterval(() => {
      setIsFading(true);
      
      // รอให้ fade out เสร็จก่อนเปลี่ยน GIF
      setTimeout(() => {
        setCurrentGifIndex(prev => (prev + 1) % gifList.length);
        setIsFading(false);
      }, 300); // ครึ่งหนึ่งของ fade duration
      
    }, 3000);

    return () => clearInterval(interval);
  }, [gifList.length]);

  return (
    <div className={styles.maintenanceContainer}>
      <div className={styles.maintenanceContent}>
        <div className={styles.maintenanceIcon}>
          <img 
            src={gifList[currentGifIndex]}
            alt="Maintenance Animation"
            className={`${styles.maintenanceGif} ${isFading ? styles.fadeOut : styles.fadeIn}`}
            key={currentGifIndex}
          />
        </div>
        <h1 className={styles.maintenanceTitle}>ระบบกำลังซ่อมบำรุง</h1>
        <p className={styles.maintenanceMessage}>
          ขออภัย ระบบกำลังอยู่ในระหว่างการซ่อมบำรุงเพื่อปรับปรุงการให้บริการ
          <br />
          กรุณาลองใหม่อีกครั้งในภายหลัง
        </p>
        <div className={styles.maintenanceInfo}>
          <p>⏰ เวลาที่คาดว่าจะเสร็จสิ้น: {estimatedCompletionTime || 'เร็วๆนี้'}</p>
          <p>📧 ติดต่อสอบถาม: {import.meta.env.VITE_SUPPORT_EMAIL || 'support@phitik.com'}</p>
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