import { useState } from 'react';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import appStyles from '../../../App.module.css';
import { authService } from '../../../services/auth/auth.service';
import AccountLockedModal from '../../../components/AccountLockedModal';

const AdminLogin: FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [showValidation, setShowValidation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lockedModal, setLockedModal] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setShowValidation(false);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShowValidation(true);
    if (!form.username || !form.password) {
      return;
    }
    setIsLoading(true);
    try {
      const response = await authService.login(form.username, form.password);
      if (response.user.is_locked) {
        setLockedModal(true);
        authService.logout();
        return;
      }
      navigate('/admin', { replace: true });
    } catch (err: unknown) {
      let msg = 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
      if (err && typeof err === 'object') {
        const errObj = err as Record<string, unknown>;
        if ('error' in errObj && typeof errObj.error === 'string') {
          msg = errObj.error;
        } else if ('message' in errObj && typeof errObj.message === 'string') {
          msg = errObj.message;
        }
      }
      setError(msg);
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={appStyles.authLayout}>
      <div className={styles.loginBox}>
        <div className={styles.header}>
          <h1 className={styles.title}>เข้าสู่ระบบผู้ดูแล</h1>
          <p className={styles.subtitle}>ยินดีต้อนรับกลับ</p>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}
          <div className={styles.inputGroup}>
            <label htmlFor="username" className={styles.label}>ชื่อผู้ใช้</label>
            <input
              type="text"
              id="username"
              name="username"
              value={form.username}
              onChange={handleChange}
              className={styles.input}
              placeholder="กรุณากรอกชื่อผู้ใช้ของคุณ"
              required
              minLength={3}
              pattern="[a-zA-Z0-9]+"
              title="กรุณากรอกตัวอักษรหรือตัวเลขอย่างน้อย 3 ตัว"
              disabled={isLoading}
              autoComplete="username"
            />
            {showValidation && !form.username && (
              <div className={styles.validationMessage}>
                กรุณากรอกชื่อผู้ใช้
              </div>
            )}
            {showValidation && form.username && form.username.length < 3 && (
              <div className={styles.validationMessage}>
                กรุณากรอกชื่อผู้ใช้อย่างน้อย 3 ตัวอักษร
              </div>
            )}
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>รหัสผ่าน</label>
            <input
              type="password"
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className={styles.input}
              placeholder="กรุณากรอกรหัสผ่านของคุณ"
              required
              minLength={4}
              title="รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร"
              disabled={isLoading}
              autoComplete="current-password"
            />
            {showValidation && !form.password && (
              <div className={styles.validationMessage}>
                กรุณากรอกรหัสผ่าน
              </div>
            )}
            {showValidation && form.password && form.password.length < 4 && (
              <div className={styles.validationMessage}>
                รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร
              </div>
            )}
          </div>
          <button 
            type="submit" 
            className={styles.loginButton}
            disabled={isLoading}
          >
            {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>
        <AccountLockedModal open={lockedModal} onClose={() => setLockedModal(false)} />
      </div>
    </div>
  );
};

export default AdminLogin; 