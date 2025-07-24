import { createContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';

export type AdminAlertType = 'info' | 'success' | 'error' | 'warning';

interface AdminAlertContextType {
  showAlert: (message: string, type?: AdminAlertType) => void;
  closeAlert: () => void;
}

const AdminAlertContext = createContext<AdminAlertContextType | undefined>(undefined);

export function AdminAlertProvider({ children }: { children: ReactNode }) {
  const showAlert = (message: string, type: AdminAlertType = 'info') => {
    if (type === 'success') toast.success(message, { duration: Infinity });
    else if (type === 'error') toast.error(message, { duration: Infinity });
    else if (type === 'warning') toast.warning(message, { duration: Infinity });
    else toast.info(message, { duration: Infinity });
  };
  const closeAlert = () => {
    toast.dismiss();
  };

  useEffect(() => {
    const messages = [
      'ระบบ : แจ้งเตือนสถานะปกติ (info) - ระบบทำงานปกติ ไม่มีปัญหาอะไรเกิดขึ้นในขณะนี้',
      'ระบบ : บันทึกข้อมูลสำเร็จ (success) - ข้อมูลของคุณถูกบันทึกเรียบร้อยแล้ว ขอบคุณที่ใช้งานระบบ',
      'ระบบ : เกิดข้อผิดพลาดบางอย่าง (error) - ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง',
      'ระบบ : มีบางอย่างต้องระวัง (warning) - พื้นที่จัดเก็บข้อมูลใกล้เต็ม กรุณาตรวจสอบ',
      'ระบบ : Info - The system is running smoothly. No issues detected at this time.',
      'ระบบ : Success - Your data has been saved successfully. Thank you for using our service.',
      'ระบบ : Error - Failed to connect to the server. Please try again later.',
      'ระบบ : Warning - Storage space is almost full. Please check your usage.',
      'ระบบ : แจ้งเตือนภาษาไทยและอังกฤษ (info) - ระบบกำลังทดสอบการแสดงผลภาษาไทยและภาษาอังกฤษใน toast',
      'ระบบ : Multilingual test (success) - This is a test notification in both Thai and English.'
    ];
    const types: AdminAlertType[] = ['info', 'success', 'error', 'warning', 'info', 'success', 'error', 'warning', 'info', 'success'];
    const interval = setInterval(() => {
      const idx = Math.floor(Math.random() * messages.length);
      showAlert(messages[idx], types[idx]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AdminAlertContext.Provider value={{ showAlert, closeAlert }}>
      {children}
    </AdminAlertContext.Provider>
  );
} 