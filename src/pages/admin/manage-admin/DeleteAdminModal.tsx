import React from 'react';
import styles from './LockAdminModal.module.css';

interface DeleteAdminModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
  errorMessage?: string;
  username?: string;
}

const DeleteAdminModal: React.FC<DeleteAdminModalProps> = ({ open, onClose, onConfirm, isSubmitting, errorMessage, username }) => {
  if (!open) return null;
  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="ปิด">×</button>
        <h2 className={styles.title} style={{ color: '#ef4444' }}>ยืนยันการลบแอดมิน</h2>
        <div className={styles.form} style={{ textAlign: 'center' }}>
          <p style={{ color: '#ef4444', fontWeight: 600, marginBottom: 18 }}>
            คุณต้องการ <b>ลบ</b> แอดมิน <b>{username || ''}</b> ใช่หรือไม่?<br />
            <span style={{ color: '#64748b', fontWeight: 400, fontSize: '0.98rem' }}>
              การลบนี้ไม่สามารถย้อนกลับได้
            </span>
          </p>
          {errorMessage && <div className={styles.error}>{errorMessage}</div>}
          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={isSubmitting}>ยกเลิก</button>
            <button type="button" className={styles.submitBtn} style={{ background: '#ef4444' }} onClick={onConfirm} disabled={isSubmitting}>
              {isSubmitting ? 'กำลังลบ...' : 'ลบ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteAdminModal; 