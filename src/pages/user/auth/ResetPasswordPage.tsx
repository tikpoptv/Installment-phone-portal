import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import styles from './ResetPasswordPage.module.css';
import { confirmPasswordReset, checkPasswordResetToken } from '../../../services/auth/passwordReset.service';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../../components/LoadingSpinner';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const [error, setError] = useState('');
  const [isValidToken, setIsValidToken] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<{
    email?: string;
    expires_at?: string;
  } | null>(null);

  // ตรวจสอบ token จาก URL เมื่อโหลดหน้า
  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
      checkToken(urlToken);
    } else {
      setError('ไม่พบรหัสยืนยัน กรุณาใช้ลิงก์ที่ถูกต้อง');
      setIsCheckingToken(false);
    }
  }, [searchParams]);

  const checkToken = async (tokenToCheck: string) => {
    try {
      setIsCheckingToken(true);
      setError('');
      
      const response = await checkPasswordResetToken(tokenToCheck);
      
      if (response.valid) {
        setIsValidToken(true);
        setTokenInfo({
          email: response.email,
          expires_at: response.expires_at
        });
        toast.success('รหัสยืนยันถูกต้อง กรุณากรอกรหัสผ่านใหม่');
      } else {
        setIsValidToken(false);
        setError(response.message || 'Token ไม่ถูกต้องหรือหมดอายุแล้ว');
        toast.error('รหัสยืนยันไม่ถูกต้องหรือหมดอายุแล้ว');
      }
    } catch (err: unknown) {
      let msg = 'เกิดข้อผิดพลาดในการตรวจสอบรหัสยืนยัน';
      if (err && typeof err === 'object' && 'message' in err && typeof (err as { message?: unknown }).message === 'string') {
        msg = (err as { message: string }).message;
      } else if (err && typeof err === 'object' && 'error' in err && typeof (err as { error?: unknown }).error === 'string') {
        msg = (err as { error: string }).error;
      }
      setError(msg);
      setIsValidToken(false);
      toast.error(msg);
    } finally {
      setIsCheckingToken(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newPassword || !confirmPassword) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      return;
    }

    if (newPassword.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await confirmPasswordReset(token, newPassword);
      toast.success('รีเซ็ตรหัสผ่านสำเร็จ');
      // ลบ token จาก URL
      window.history.replaceState({}, document.title, window.location.pathname);
      // ไปหน้า login
      navigate('/user/login');
    } catch (err: unknown) {
      let msg = 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน';
      if (err && typeof err === 'object' && 'message' in err && typeof (err as { message?: unknown }).message === 'string') {
        msg = (err as { message: string }).message;
      } else if (err && typeof err === 'object' && 'error' in err && typeof (err as { error?: unknown }).error === 'string') {
        msg = (err as { error: string }).error;
      }
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/user/login');
  };

  const handleRequestNewLink = () => {
    navigate('/user/login');
  };

  // แสดง loading ขณะตรวจสอบ token
  if (isCheckingToken) {
    return (
      <div className={styles.container}>
        <div className={styles.resetBox}>
          <div className={styles.loadingContainer}>
            <LoadingSpinner size={48} />
            <h2 className={styles.loadingTitle}>กำลังตรวจสอบรหัสยืนยัน...</h2>
            <p className={styles.loadingMessage}>กรุณารอสักครู่</p>
          </div>
        </div>
      </div>
    );
  }

  // แสดง error ถ้า token ไม่ถูกต้อง
  if (!isValidToken) {
    return (
      <div className={styles.container}>
        <div className={styles.resetBox}>
          <div className={styles.errorContainer}>
            <div className={styles.errorIcon}>⚠️</div>
            <h1 className={styles.title}>ลิงก์ไม่ถูกต้อง</h1>
            <p className={styles.errorMessage}>{error}</p>
            <div className={styles.errorActions}>
              <button onClick={handleBackToLogin} className={styles.backButton}>
                กลับไปหน้าเข้าสู่ระบบ
              </button>
              <button onClick={handleRequestNewLink} className={styles.requestNewButton}>
                ขอลิงก์ใหม่
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.resetBox}>
        <h1 className={styles.title}>รีเซ็ตรหัสผ่าน</h1>
        
        {tokenInfo?.email && (
          <div className={styles.tokenInfo}>
            <p>📧 อีเมล: <strong>{tokenInfo.email}</strong></p>
            {tokenInfo.expires_at && (
              <p>⏰ หมดอายุ: <strong>{new Date(tokenInfo.expires_at).toLocaleString('th-TH')}</strong></p>
            )}
          </div>
        )}
        
        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="newPassword">รหัสผ่านใหม่</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)"
              required
              className={styles.input}
              minLength={6}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword">ยืนยันรหัสผ่านใหม่</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="ยืนยันรหัสผ่านใหม่"
              required
              className={styles.input}
            />
          </div>

          <div className={styles.description}>
            รหัสยืนยันจะหมดอายุใน 1 ชั่วโมง
          </div>

          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size={16} />
                กำลังรีเซ็ต...
              </>
            ) : (
              'รีเซ็ตรหัสผ่าน'
            )}
          </button>

          <button 
            type="button" 
            className={styles.backButton}
            onClick={handleBackToLogin}
            disabled={isLoading}
          >
            กลับไปหน้าเข้าสู่ระบบ
          </button>
        </form>
      </div>
    </div>
  );
} 