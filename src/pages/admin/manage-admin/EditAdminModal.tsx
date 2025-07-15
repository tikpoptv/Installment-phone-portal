import React, { useState, useEffect } from 'react';
import styles from './CreateAdminModal.module.css';
import type { EditAdminModalProps } from '../../../services/admin.service';

// เพิ่ม type ใหม่ที่รองรับ onSuccess (optional)
type EditAdminModalWithSuccessProps = EditAdminModalProps & {
  onSuccess?: () => void;
};

const EditAdminModal: React.FC<EditAdminModalWithSuccessProps> = ({ open, onClose, onSubmit, adminId, initialUsername, initialRole, isSubmitting, errorMessage, onSuccess }) => {
  const [username, setUsername] = useState(initialUsername);
  const [role, setRole] = useState<'superadmin' | 'staff'>(initialRole);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setUsername(initialUsername);
      setRole(initialRole);
      setError('');
    }
  }, [open, initialUsername, initialRole]);

  // ลบ useEffect ที่แสดง toast.success

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
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
    onSubmit(adminId, { username: username.trim(), role });
    if (onSuccess) onSuccess();
  };

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="ปิด">×</button>
        <h2 className={styles.title}>แก้ไขข้อมูลแอดมิน</h2>
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
          {errorMessage && <div className={styles.error}>{errorMessage}</div>}
          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={isSubmitting}>ยกเลิก</button>
            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
              {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAdminModal; 