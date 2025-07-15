import React, { useState, useEffect } from 'react';
import styles from './LockAdminModal.module.css';

interface LockAdminModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (isLocked: boolean) => void;
  isLocked: boolean; // สถานะปัจจุบัน
  isSubmitting?: boolean;
  errorMessage?: string;
  username?: string;
}

const LockAdminModal: React.FC<LockAdminModalProps> = ({ open, onClose, onSubmit, isLocked, isSubmitting, errorMessage, username }) => {
  const [lock, setLock] = useState(isLocked);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setLock(isLocked);
      setError('');
    }
  }, [open, isLocked]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(lock);
  };

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="ปิด">×</button>
        <h2 className={styles.title}>{lock ? 'ยืนยันการล็อกแอดมิน' : 'ยืนยันการปลดล็อกแอดมิน'}</h2>
        <div className={styles.form} style={{textAlign:'center'}}>
          <p>คุณต้องการ{lock ? 'ล็อก' : 'ปลดล็อก'}แอดมิน <b>{username || ''}</b> ใช่หรือไม่?</p>
          <div style={{margin:'16px 0'}}>
            <div className={styles.radioGroup}>
              <label className={lock ? `${styles.radioOption} ${styles.selected}` : styles.radioOption}>
                <input type="radio" checked={lock} onChange={() => setLock(true)} disabled={isSubmitting} /> ล็อก
              </label>
              <label className={!lock ? `${styles.radioOption} ${styles.selected}` : styles.radioOption}>
                <input type="radio" checked={!lock} onChange={() => setLock(false)} disabled={isSubmitting} /> ปลดล็อก
              </label>
            </div>
          </div>
          {error && <div className={styles.error}>{error}</div>}
          {errorMessage && <div className={styles.error}>{errorMessage}</div>}
          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={isSubmitting}>ยกเลิก</button>
            <button type="button" className={styles.submitBtn} onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (lock ? 'กำลังล็อก...' : 'กำลังปลดล็อก...') : (lock ? 'ล็อก' : 'ปลดล็อก')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LockAdminModal; 