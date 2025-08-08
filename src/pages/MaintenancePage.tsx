import React, { useState, useEffect } from 'react';
import styles from './MaintenancePage.module.css';
import { useMaintenance } from '../hooks/useMaintenance';
import { DOMAINS } from '../utils/domains';
import { getPortalMaintenance } from '../services/portal-maintenance.service';

const MaintenancePage: React.FC = () => {
  const { estimatedCompletionTime } = useMaintenance();
  const [currentGifIndex, setCurrentGifIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loopProgress, setLoopProgress] = useState(0);
  
  // แยก remark เป็นหมวดๆ
  const parseMaintenanceInfo = (description: string | undefined) => {
    if (!description) return { time: 'เร็วๆนี้', remark: '', isDeploy: false };
    
    // ตรวจสอบคำว่า deploy
    const isDeploy = description.toLowerCase().includes('deploy');
    
    // ถ้ามี format "time / remark"
    if (description.includes(' / ')) {
      const [time, remark] = description.split(' / ');
      return { time: time.trim(), remark: remark.trim(), isDeploy };
    }
    
    // ถ้าไม่มี format ให้ใช้ description เป็น remark
    return { time: 'เร็วๆนี้', remark: description, isDeploy };
  };
  
  const maintenanceInfo = parseMaintenanceInfo(estimatedCompletionTime);
  
  // คำนวณเวลาที่เหลือ
  const calculateTimeRemaining = () => {
    if (maintenanceInfo.time === 'เร็วๆนี้') return null;
    
    try {
      const now = new Date();
      const [hours, minutes] = maintenanceInfo.time.split(':').map(Number);
      const targetTime = new Date();
      targetTime.setHours(hours, minutes, 0, 0);
      
      // ถ้าเวลาที่คาดไว้เป็นวันถัดไป
      if (targetTime <= now) {
        targetTime.setDate(targetTime.getDate() + 1);
      }
      
      return targetTime.getTime() - now.getTime();
    } catch {
      return null;
    }
  };
  
  const timeRemaining = calculateTimeRemaining();
  
  // Progress bar animation - อิงตามเวลาจริง
  useEffect(() => {
    if (maintenanceInfo.isDeploy) {
      // หน้า Deploy ใช้ 10 นาที
      const duration = 10 * 60 * 1000;
      const interval = 100;
      const increment = (interval / duration) * 100;
      
      const timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) return 100;
          return Math.min(prev + increment, 100);
        });
      }, interval);

      return () => clearInterval(timer);
    } else {
      // หน้า Maintenance อิงตามเวลาจริง
      if (maintenanceInfo.time === 'เร็วๆนี้') {
        // Loop โหลด 10 วินาที
        const timer = setInterval(() => {
          setLoopProgress(prev => {
            if (prev >= 100) {
              // เมื่อถึง 100% ให้ยิง API เช็ค
              getPortalMaintenance().then(response => {
                if (response && response.value === 'false') {
                  // ถ้า maintenance mode หยุดแล้ว ให้รีเฟรชหน้า
                  window.location.reload();
                }
              }).catch(error => {
                console.error("Error fetching portal maintenance status:", error);
              });
              return 0;
            }
            return prev + 10;
          });
        }, 1000);

        return () => clearInterval(timer);
      } else if (timeRemaining) {
        // คำนวณตามเวลาจริง
        const interval = 1000; // อัปเดตทุก 1 วินาที
        const startTime = Date.now();
        
        const timer = setInterval(() => {
          const now = Date.now();
          const elapsed = now - startTime;
          const newProgress = Math.min((elapsed / timeRemaining) * 100, 100);
          setProgress(newProgress);
          
          if (newProgress >= 100) {
            clearInterval(timer);
          }
        }, interval);

        return () => clearInterval(timer);
      }
    }
  }, [maintenanceInfo.isDeploy, maintenanceInfo.time, timeRemaining]);
  
  // Auto refresh ทุก 1 นาที ตลอด 10 นาที (เฉพาะกรณีที่ไม่ใช่ "เร็วๆนี้" และไม่ใช่ deploy)
  useEffect(() => {
    // ถ้าเป็น "เร็วๆนี้" หรือ deploy ไม่ต้องใช้
    if (maintenanceInfo.time === 'เร็วๆนี้' || maintenanceInfo.isDeploy) return;
    
    const interval = setInterval(() => {
      getPortalMaintenance().then(response => {
        if (response && response.value === 'false') {
          // ถ้า maintenance mode หยุดแล้ว ให้รีเฟรชหน้า
          window.location.reload();
        }
      }).catch(error => {
        console.error("Error fetching portal maintenance status:", error);
      });
    }, 60000); // 1 นาที

    return () => clearInterval(interval);
  }, [maintenanceInfo.time, maintenanceInfo.isDeploy]);
  
  // Fetch API ทุก 1 นาทีสำหรับกรณีที่มีเวลาคาดการณ์
  useEffect(() => {
    // ถ้าเป็น "เร็วๆนี้" ไม่ต้องใช้ เพราะมี loop progress bar แล้ว
    if (maintenanceInfo.time === 'เร็วๆนี้') return;
    
    const interval = setInterval(() => {
      getPortalMaintenance().then(response => {
        if (response && response.value === 'false') {
          // ถ้า maintenance mode หยุดแล้ว ให้รีเฟรชหน้า
          window.location.reload();
        }
      }).catch(error => {
        console.error("Error fetching portal maintenance status:", error);
      });
    }, 60000); // 1 นาที

    return () => clearInterval(interval);
  }, [maintenanceInfo.time]);
  
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
      {/* แสดง Deploy Modal แทนหน้า maintenance ปกติ */}
      {maintenanceInfo.isDeploy ? (
        <div className={styles.maintenanceContent}>
          <div className={styles.maintenanceIcon}>
            <div style={{
              fontSize: 80,
              animation: 'pulse 2s infinite',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 120
            }}>
              🚀
            </div>
          </div>
          <h1 className={styles.maintenanceTitle}>ระบบกำลังอัพเดท</h1>
          <p className={styles.maintenanceMessage}>
            ระบบกำลังทำการอัพเดทโปรแกรมใหม่
            <br />
            กรุณารอสักครู่ ระบบจะพร้อมใช้งานในไม่ช้า
          </p>
          
          {/* Progress Bar */}
          <div style={{
            width: '100%',
            maxWidth: 400,
            margin: '20px auto',
            background: '#f1f5f9',
            borderRadius: 10,
            overflow: 'hidden',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              width: `${Math.min(progress, 100)}%`,
              height: 8,
              background: 'linear-gradient(90deg, #0ea5e9, #06b6d4, #0891b2)',
              borderRadius: 10,
              transition: 'width 0.5s ease-in-out',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                animation: 'shimmer 2s infinite'
              }}></div>
            </div>
          </div>
          
          {/* Progress Text */}
          <div style={{
            fontSize: 14,
            color: '#0ea5e9',
            fontWeight: 600,
            marginBottom: 20
          }}>
            ความคืบหน้า: {Math.round(progress)}% (ใช้เวลา 10 นาที)
          </div>
          
          <div className={styles.maintenanceInfo}>
            <p>⏱️ เวลาที่คาดว่าจะเสร็จสิ้น: {maintenanceInfo.time}</p>
            {maintenanceInfo.remark && (
              <p>📝 หมายเหตุ: {maintenanceInfo.remark}</p>
            )}
            <p>📧 ติดต่อสอบถาม: {DOMAINS.SUPPORT_EMAIL}</p>
          </div>
          <button 
            className={styles.retryButton}
            onClick={() => window.location.reload()}
          >
            🔄 รีเฟรชหน้า
          </button>
        </div>
      ) : (
        /* หน้า Maintenance ปกติ */
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
          
          {/* Progress Bar */}
          <div style={{
            width: '100%',
            maxWidth: 400,
            margin: '20px auto',
            background: '#f1f5f9',
            borderRadius: 10,
            overflow: 'hidden',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              width: `${maintenanceInfo.time === 'เร็วๆนี้' ? loopProgress : Math.min(progress, 100)}%`,
              height: 8,
              background: 'linear-gradient(90deg, #f59e0b, #f97316, #ea580c)',
              borderRadius: 10,
              transition: 'width 0.5s ease-in-out',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                animation: 'shimmer 2s infinite'
              }}></div>
            </div>
          </div>
          
          {/* Progress Text */}
          <div style={{
            fontSize: 14,
            color: '#f59e0b',
            fontWeight: 600,
            marginBottom: 20
          }}>
            {maintenanceInfo.time === 'เร็วๆนี้' ? (
              'กำลังโหลด... ไม่มีกำหนด'
            ) : (
              `ความคืบหน้า: ${Math.round(progress)}% (ถึง ${maintenanceInfo.time})`
            )}
          </div>
          
          <div className={styles.maintenanceInfo}>
            <p>⏰ เวลาที่คาดว่าจะเสร็จสิ้น: {maintenanceInfo.time}</p>
            {maintenanceInfo.remark && (
              <p>📝 หมายเหตุ: {maintenanceInfo.remark}</p>
            )}
            <p>📧 ติดต่อสอบถาม: {DOMAINS.SUPPORT_EMAIL}</p>
          </div>
          <button 
            className={styles.retryButton}
            onClick={() => window.location.reload()}
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      )}
    </div>
  );
};

export default MaintenancePage; 