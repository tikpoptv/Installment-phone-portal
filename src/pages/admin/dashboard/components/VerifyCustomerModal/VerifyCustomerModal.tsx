import React, { useState, useEffect } from 'react';
import styles from './VerifyCustomerModal.module.css';

interface VerifyCustomerModalProps {
  open: boolean;
  onClose: () => void;
}

// mock ข้อมูลผู้ใช้ที่ยังไม่ได้ verify
const mockUnverifiedUsers = [
  {
    id: 'b7e23ec2-05c8-4c2e-8e7a-1b2e3c4d5f6a',
    first_name: 'สมชาย',
    last_name: 'ใจดี',
    phone_number: '0812345678',
    email: 'somchai@email.com',
    created_at: '2024-06-01T10:00:00Z',
  },
  {
    id: 'a1b2c3d4-5678-90ab-cdef-1234567890ab',
    first_name: 'สายฝน',
    last_name: 'สดใส',
    phone_number: '0898765432',
    email: 'saifon@email.com',
    created_at: '2024-06-02T14:30:00Z',
  },
];

const VerifyCustomerModal: React.FC<VerifyCustomerModalProps> = ({ open, onClose }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!open) return null;
  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        {isMobile ? (
          <div className={styles.mobileAlertBox}>
            <div className={styles.mobileAlertIcon}>⚠️</div>
            <div className={styles.mobileAlertTitle}>ขออภัย ไม่สามารถใช้งานฟีเจอร์นี้บนมือถือได้</div>
            <div className={styles.mobileAlertText}>
              เนื่องจากข้อมูลที่ต้องแสดงมีจำนวนมาก อาจทำให้เกิดข้อผิดพลาดหรือแสดงผลไม่สมบูรณ์บนหน้าจอขนาดเล็ก<br />
              กรุณาใช้งานฟีเจอร์นี้ผ่าน iPad หรือคอมพิวเตอร์
            </div>
            <button className={styles.closeButton} onClick={onClose} style={{marginTop: 18}}>ปิด</button>
          </div>
        ) : (
          <>
            <h2 className={styles.modalTitle}>รายชื่อผู้ใช้ที่ยังไม่ได้ยืนยันตัวตน</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.userTable}>
                <thead>
                  <tr>
                    <th>ชื่อ</th>
                    <th>เบอร์</th>
                    <th>อีเมล</th>
                    <th>วันที่สมัคร</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {mockUnverifiedUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.first_name} {user.last_name}</td>
                      <td>{user.phone_number}</td>
                      <td>{user.email}</td>
                      <td>{new Date(user.created_at).toLocaleDateString('th-TH')}</td>
                      <td>
                        <button className={styles.detailButton} aria-label={`ดูรายละเอียดของ ${user.first_name} ${user.last_name}`}>
                          <span className={styles.detailButtonIcon}>🔍</span>
                          <span className={styles.detailButtonText}>ดูรายละเอียด</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className={styles.closeButton} onClick={onClose}>ปิด</button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyCustomerModal; 