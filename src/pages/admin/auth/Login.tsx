import { useState } from 'react';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import appStyles from '../../../App.module.css';
import { authService } from '../../../services/auth/auth.service';

interface ApiError {
  error: string;
}

const AdminLogin: FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [showValidation, setShowValidation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // ซ่อน validation message เมื่อผู้ใช้เริ่มพิมพ์
    setShowValidation(false);
    // ล้าง error message เมื่อผู้ใช้เริ่มพิมพ์
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setShowValidation(true);

    // ตรวจสอบว่ากรอกข้อมูลครบหรือไม่
    if (!formData.username || !formData.password) {
      return;
    }

    setIsLoading(true);
    try {
      await authService.login(formData.username, formData.password);
      navigate('/admin');
    } catch (err) {
      // แสดง error message จาก backend โดยตรง
      const apiError = err as ApiError;
      setError(apiError.error);
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
              value={formData.username}
              onChange={handleChange}
              className={styles.input}
              placeholder="กรุณากรอกชื่อผู้ใช้ของคุณ"
              required
              minLength={3}
              pattern="[a-zA-Z0-9]+"
              title="กรุณากรอกตัวอักษรหรือตัวเลขอย่างน้อย 3 ตัว"
              disabled={isLoading}
            />
            {showValidation && !formData.username && (
              <div className={styles.validationMessage}>
                กรุณากรอกชื่อผู้ใช้
              </div>
            )}
            {showValidation && formData.username && formData.username.length < 3 && (
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
              value={formData.password}
              onChange={handleChange}
              className={styles.input}
              placeholder="กรุณากรอกรหัสผ่านของคุณ"
              required
              minLength={4}
              title="รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร"
              disabled={isLoading}
            />
            {showValidation && !formData.password && (
              <div className={styles.validationMessage}>
                กรุณากรอกรหัสผ่าน
              </div>
            )}
            {showValidation && formData.password && formData.password.length < 4 && (
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

          <div className={styles.registerLink}>
            ยังไม่มีบัญชี? <a href="/register" className={styles.link}>สมัครสมาชิก</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin; 