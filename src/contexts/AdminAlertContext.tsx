import { createContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import { useLocation } from 'react-router-dom';
import { useCallback } from 'react';
import { useState } from 'react';

export type AdminAlertType = 'info' | 'success' | 'error' | 'warning';

interface AdminAlertContextType {
  showAlert: (message: string, type?: AdminAlertType) => void;
  closeAlert: () => void;
}

const AdminAlertContext = createContext<AdminAlertContextType | undefined>(undefined);

export function AdminAlertProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  
  // เช็คว่าอยู่ใน admin domain และ login แล้วหรือไม่
  const isAdminDomain = location.pathname.startsWith('/admin');
  const isLoggedIn = localStorage.getItem('auth_token') && localStorage.getItem('auth_user');
  const [toastCount, setToastCount] = useState(0);
  
  const showAlert = useCallback((message: string, type: AdminAlertType = 'info') => {
    // แสดงเฉพาะใน admin domain และ login แล้วเท่านั้น
    if (!isAdminDomain || !isLoggedIn) return;
    
    const currentCount = toastCount + 1;
    setToastCount(currentCount);
    
    // ใช้ setTimeout เพื่อให้แน่ใจว่าเป็น toast ล่าสุด
    setTimeout(() => {
      if (type === 'success') toast.success(message, { 
        duration: Infinity,
        action: currentCount > 5 ? {
          label: 'ปิดทั้งหมด',
          onClick: () => {
            toast.dismiss();
            setToastCount(0);
          }
        } : undefined
      });
      else if (type === 'error') toast.error(message, { 
        duration: Infinity,
        action: currentCount > 5 ? {
          label: 'ปิดทั้งหมด',
          onClick: () => {
            toast.dismiss();
            setToastCount(0);
          }
        } : undefined
      });
      else if (type === 'warning') toast.warning(message, { 
        duration: Infinity,
        action: currentCount > 5 ? {
          label: 'ปิดทั้งหมด',
          onClick: () => {
            toast.dismiss();
            setToastCount(0);
          }
        } : undefined
      });
      else toast.info(message, { 
        duration: Infinity,
        action: currentCount > 5 ? {
          label: 'ปิดทั้งหมด',
          onClick: () => {
            toast.dismiss();
            setToastCount(0);
          }
        } : undefined
      });
    }, 100); // รอ 100ms เพื่อให้แน่ใจว่าเป็น toast ล่าสุด
  }, [isAdminDomain, isLoggedIn, toastCount]);
  const closeAlert = useCallback(() => {
    toast.dismiss();
  }, []);

  useEffect(() => {
    // ไม่แสดง toast ถ้าไม่ได้อยู่ใน admin domain หรือไม่ได้ login
    if (!isAdminDomain || !isLoggedIn) return;
    
    // ลบ mock data ทั้งหมดออก
    // const messages = [
    //   'ระบบ : แจ้งเตือนสถานะปกติ (info) - ระบบทำงานปกติ ไม่มีปัญหาอะไรเกิดขึ้นในขณะนี้',
    //   'ระบบ : บันทึกข้อมูลสำเร็จ (success) - ข้อมูลของคุณถูกบันทึกเรียบร้อยแล้ว ขอบคุณที่ใช้งานระบบ',
    //   'ระบบ : เกิดข้อผิดพลาดบางอย่าง (error) - ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง',
    //   'ระบบ : มีบางอย่างต้องระวัง (warning) - พื้นที่จัดเก็บข้อมูลใกล้เต็ม กรุณาตรวจสอบ'
    // ];
    // const types: AdminAlertType[] = ['info', 'success', 'error', 'warning'];
    // const interval = setInterval(() => {
    //   const idx = Math.floor(Math.random() * messages.length);
    //   showAlert(messages[idx], types[idx]);
    // }, 5000);
    // return () => clearInterval(interval);
  }, [isAdminDomain, isLoggedIn, showAlert]);

  return (
    <AdminAlertContext.Provider value={{ showAlert, closeAlert }}>
      {children}
    </AdminAlertContext.Provider>
  );
} 