import React, { useState } from 'react';
import styles from './CreateAdminModal.module.css';

interface CreateAdminModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { username: string; role: 'superadmin' | 'staff' }) => void;
  isSubmitting?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  errorMessage?: string;
}

const CreateAdminModal: React.FC<CreateAdminModalProps> = ({ open, onClose, onSubmit, isSubmitting, isError, errorMessage }) => {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<'superadmin' | 'staff'>('staff');
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('กรุณากรอกชื่อผู้ใช้');
      return;
    }
    if (!role) {
      setError('กรุณาเลือกสิทธิ์');
      return;
    }
    setError('');
    onSubmit({ username: username.trim(), role });
  };

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="ปิด">×</button>
        <h2 className={styles.title}>สร้างแอดมินใหม่</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            ชื่อผู้ใช้
            <input
              className={styles.input}
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoFocus
              required
              disabled={isSubmitting}
            />
          </label>
          <label className={styles.label}>
            สิทธิ์
            <select
              className={styles.select}
              value={role}
              onChange={e => setRole(e.target.value as 'superadmin' | 'staff')}
              required
              disabled={isSubmitting}
            >
              <option value="staff">Staff</option>
              <option value="superadmin">Super Admin</option>
            </select>
          </label>
          {error && <div className={styles.error}>{error}</div>}
          {isError && errorMessage && <div className={styles.error}>{errorMessage}</div>}
          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={isSubmitting}>ยกเลิก</button>
            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
              {isSubmitting ? 'กำลังสร้าง...' : 'สร้าง'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAdminModal; 