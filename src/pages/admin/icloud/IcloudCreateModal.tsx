import React, { useState, useEffect } from 'react';
import styles from './IcloudCreateModal.module.css';
import { createIcloudCredential } from '../../../services/icloud.service';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

interface IcloudCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (data: {
    owner_type: 'customer' | 'store';
    icloud_username: string;
    icloud_password: string;
    note?: string;
  }) => void;
}

const initialForm = {
  owner_type: 'customer' as 'customer' | 'store',
  icloud_username: '',
  icloud_password: '',
  note: '',
};

const IcloudCreateModal: React.FC<IcloudCreateModalProps> = ({ open, onClose, onSuccess }) => {
  const [form, setForm] = useState<typeof initialForm>(initialForm);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(initialForm);
      setError('');
    }
  }, [open]);

  if (!open) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.icloud_username.trim() || !form.icloud_password.trim()) {
      setError('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน iCloud');
      return;
    }
    setSubmitting(true);
    try {
      const result = await createIcloudCredential(form);
      if (onSuccess) onSuccess(result);
      onClose();
    } catch (err: unknown) {
      let errorMsg = 'เกิดข้อผิดพลาดในการสร้างบัญชี iCloud';
      if (err && typeof err === 'object') {
        const e = err as { status?: number; message?: string; error?: string };
        if (e.status === 409) {
          errorMsg = 'ชื่อผู้ใช้ iCloud นี้ถูกใช้งานแล้ว';
        } else if (
          (typeof e.message === 'string' && e.message.includes('SQLSTATE 23505')) ||
          (typeof e.error === 'string' && e.error.includes('SQLSTATE 23505')) ||
          (typeof e.message === 'string' && e.message.includes('duplicate key')) ||
          (typeof e.error === 'string' && e.error.includes('duplicate key'))
        ) {
          errorMsg = 'ชื่อผู้ใช้ iCloud นี้ถูกใช้งานแล้ว';
        } else if (e.message) {
          errorMsg = e.message;
        }
      }
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="ปิด"
        >
          ×
        </button>
        <h2 className={styles.title}>สร้างบัญชี iCloud ใหม่</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.labelRow}>
            <span className={styles.labelText}>ประเภทเจ้าของ</span>
            <span className={styles.required}>*</span>
          </div>
          <select
            name="owner_type"
            value={form.owner_type}
            onChange={handleChange}
            className={styles.input}
            required
          >
            <option value="customer">ลูกค้า</option>
            <option value="store">ร้านค้า</option>
          </select>

          <div className={styles.labelRow}>
            <span className={styles.labelText}>ชื่อผู้ใช้ iCloud</span>
            <span className={styles.required}>*</span>
          </div>
          <input
            type="text"
            name="icloud_username"
            value={form.icloud_username}
            onChange={handleChange}
            className={styles.input}
            required
            autoComplete="off"
            placeholder="example@icloud.com"
          />

          <div className={styles.labelRow}>
            <span className={styles.labelText}>รหัสผ่าน iCloud</span>
            <span className={styles.required}>*</span>
          </div>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              name="icloud_password"
              value={form.icloud_password}
              onChange={handleChange}
              className={styles.input}
              required
              autoComplete="new-password"
              placeholder="กรอกรหัสผ่าน"
              style={{ flex: 1, paddingRight: 38 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
              tabIndex={-1}
              aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
            >
              {showPassword ? (
                <FaEyeSlash size={22} color="#64748b" />
              ) : (
                <FaEye size={22} color="#64748b" />
              )}
            </button>
          </div>

          <div className={styles.labelRow}>
            <span className={styles.labelText}>หมายเหตุ (ถ้ามี)</span>
          </div>
          <textarea
            name="note"
            value={form.note}
            onChange={handleChange}
            className={styles.input}
            rows={2}
            placeholder="ระบุหมายเหตุเพิ่มเติม (ถ้ามี)"
          />
          {error && <div className={styles.error}>{error}</div>}
          <div className={styles.buttonGroup}>
            <button type="submit" className={styles.submitButton} disabled={submitting}>
              {submitting ? 'กำลังบันทึก...' : 'สร้างบัญชี iCloud'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IcloudCreateModal; 