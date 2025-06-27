import React, { useState, useEffect } from 'react';
import styles from './VerifyCustomerModal.module.css';
import { getUnverifiedUsers } from '../../../../../services/dashboard/unverified/unverified.service';
import type { UnverifiedUser } from '../../../../../services/dashboard/unverified/unverified.service';
import UserDetailModal from './UserDetailModal';
import MobileAccessModal from '../../../../../components/MobileAccessModal';

interface VerifyCustomerModalProps {
  open: boolean;
  onClose: () => void;
}

const VerifyCustomerModal: React.FC<VerifyCustomerModalProps> = ({ open, onClose }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [users, setUsers] = useState<UnverifiedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (open && !isMobile) {
      setLoading(true);
      setError(null);
      getUnverifiedUsers()
        .then(data => setUsers(data ?? []))
        .catch((err: unknown) => {
          const error = err as { status?: number };
          if (error.status === 401 || error.status === 403) {
            setError('คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้');
          } else {
            setError('เกิดข้อผิดพลาดในการดึงข้อมูล');
          }
        })
        .finally(() => setLoading(false));
    }
    if (!open) {
      setUsers([]);
      setError(null);
      setSelectedUserId(null);
    }
  }, [open, isMobile]);

  // ปิด detail แล้วกลับมา modal หลัก
  const handleCloseDetail = () => {
    setSelectedUserId(null);
  };

  if (!open && !selectedUserId) return null;
  return (
    <>
      {/* Popup รายละเอียด user */}
      <UserDetailModal open={!!selectedUserId} onClose={handleCloseDetail} userId={selectedUserId || ''} />
      {/* Popup รายชื่อ (modal หลัก) */}
      {open && !selectedUserId && (
        <>
          <MobileAccessModal open={isMobile && open && !selectedUserId} mode="block" onCancel={onClose} />
          {!isMobile && (
            <div className={styles.modalBackdrop}>
              <div className={styles.modalContent}>
                <h2 className={styles.modalTitle}>รายชื่อผู้ใช้ที่ยังไม่ได้ยืนยันตัวตน</h2>
                <div className={styles.tableWrapper}>
                  {loading ? (
                    <div style={{textAlign: 'center', color: '#0ea5e9', padding: '24px 0'}}>กำลังโหลดข้อมูล...</div>
                  ) : error ? (
                    <div style={{textAlign: 'center', color: '#ef4444', padding: '24px 0'}}>{error}</div>
                  ) : !users || users.length === 0 ? (
                    <div style={{textAlign: 'center', color: '#64748b', padding: '24px 0'}}>ไม่พบข้อมูลผู้ใช้ที่ยังไม่ได้ยืนยันตัวตน</div>
                  ) : (
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
                        {users.map((user) => (
                          <tr key={user.id}>
                            <td>{user.first_name} {user.last_name}</td>
                            <td>{user.phone_number}</td>
                            <td>{user.email}</td>
                            <td>{new Date(user.created_at).toLocaleDateString('th-TH')}</td>
                            <td>
                              <button className={styles.detailButton} aria-label={`ดูรายละเอียดของ ${user.first_name} ${user.last_name}`}
                                onClick={() => setSelectedUserId(user.id)}>
                                <span className={styles.detailButtonIcon}>🔍</span>
                                <span className={styles.detailButtonText}>ดูรายละเอียด</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
                <button className={styles.closeButton} onClick={onClose}>ปิด</button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default VerifyCustomerModal; 