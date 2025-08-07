import React, { useState, useEffect } from 'react';
import styles from './ForgotPasswordModal.module.css';
import { requestPasswordReset } from '../../../services/auth/passwordReset.service';
import { toast } from 'react-toastify';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const [rateLimitCountdown, setRateLimitCountdown] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);

  // นับถอยหลัง
  useEffect(() => {
    let timer: number;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // นับถอยหลังสำหรับ rate limit
  useEffect(() => {
    let timer: number;
    if (rateLimitCountdown > 0) {
      timer = setTimeout(() => {
        setRateLimitCountdown(rateLimitCountdown - 1);
      }, 1000);
    } else {
      setIsRateLimited(false);
    }
    return () => clearTimeout(timer);
  }, [rateLimitCountdown]);

  // Format เวลาเป็น mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // แยกเวลาจากข้อความ error
  const extractTimeFromError = (errorMessage: string): number => {
    const timeMatch = errorMessage.match(/(\d+)\s*นาที\s*(\d+)\s*วินาที/);
    if (timeMatch) {
      const minutes = parseInt(timeMatch[1]);
      const seconds = parseInt(timeMatch[2]);
      return minutes * 60 + seconds;
    }
    
    // กรณีมีแค่นาที
    const minuteMatch = errorMessage.match(/(\d+)\s*นาที/);
    if (minuteMatch) {
      const minutes = parseInt(minuteMatch[1]);
      return minutes * 60;
    }
    
    // กรณีมีแค่วินาที
    const secondMatch = errorMessage.match(/(\d+)\s*วินาที/);
    if (secondMatch) {
      const seconds = parseInt(secondMatch[1]);
      return seconds;
    }
    
    return 0;
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('กรุณากรอกอีเมล');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await requestPasswordReset(email);
      setIsSuccess(true);
      setCountdown(300); // 5 นาที = 300 วินาที
      setCanResend(false);
      setIsRateLimited(false);
      setRateLimitCountdown(0);
      toast.success('ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว');
    } catch (err: unknown) {
      let msg = 'เกิดข้อผิดพลาดในการส่งอีเมล';
      let isRateLimitError = false;
      
      if (err && typeof err === 'object') {
        // ตรวจสอบ error response
        if ('status' in err && err.status === 429) {
          isRateLimitError = true;
          if ('error' in err && typeof err.error === 'string') {
            msg = err.error;
            const waitTime = extractTimeFromError(err.error);
            if (waitTime > 0) {
              setRateLimitCountdown(waitTime);
              setIsRateLimited(true);
            }
          } else {
            msg = 'กรุณารอสักครู่ก่อนขอรีเซ็ตรหัสผ่านใหม่';
            setRateLimitCountdown(300); // 5 นาที default
            setIsRateLimited(true);
          }
        } else if ('message' in err && typeof err.message === 'string') {
          msg = err.message;
        } else if ('error' in err && typeof err.error === 'string') {
          msg = err.error;
        }
      }
      
      setError(msg);
      if (isRateLimitError) {
        toast.error('กรุณารอสักครู่ก่อนขอรีเซ็ตรหัสผ่านใหม่');
      } else {
        toast.error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!canResend || countdown > 0 || isRateLimited) return;

    setIsLoading(true);
    setError('');

    try {
      await requestPasswordReset(email);
      setCountdown(300); // 5 นาที = 300 วินาที
      setCanResend(false);
      setIsRateLimited(false);
      setRateLimitCountdown(0);
      toast.success('ส่งลิงก์รีเซ็ตรหัสผ่านใหม่แล้ว');
    } catch (err: unknown) {
      let msg = 'เกิดข้อผิดพลาดในการส่งอีเมล';
      let isRateLimitError = false;
      
      if (err && typeof err === 'object') {
        // ตรวจสอบ error response
        if ('status' in err && err.status === 429) {
          isRateLimitError = true;
          if ('error' in err && typeof err.error === 'string') {
            msg = err.error;
            const waitTime = extractTimeFromError(err.error);
            if (waitTime > 0) {
              setRateLimitCountdown(waitTime);
              setIsRateLimited(true);
            }
          } else {
            msg = 'กรุณารอสักครู่ก่อนขอรีเซ็ตรหัสผ่านใหม่';
            setRateLimitCountdown(300); // 5 นาที default
            setIsRateLimited(true);
          }
        } else if ('message' in err && typeof err.message === 'string') {
          msg = err.message;
        } else if ('error' in err && typeof err.error === 'string') {
          msg = err.error;
        }
      }
      
      setError(msg);
      if (isRateLimitError) {
        toast.error('กรุณารอสักครู่ก่อนขอรีเซ็ตรหัสผ่านใหม่');
      } else {
        toast.error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset form
    setEmail('');
    setError('');
    setIsSuccess(false);
    setCountdown(0);
    setCanResend(true);
    setIsRateLimited(false);
    setRateLimitCountdown(0);
  };

  const handleTryAgain = () => {
    setEmail('');
    setError('');
    setIsSuccess(false);
    setCountdown(0);
    setCanResend(true);
    setIsRateLimited(false);
    setRateLimitCountdown(0);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={handleClose} aria-label="ปิด">
          ×
        </button>
        
        <div className={styles.modalHeader}>
          <h2 className={styles.title}>ลืมรหัสผ่าน</h2>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {!isSuccess ? (
          <form onSubmit={handleRequestReset} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="email">อีเมล</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="กรอกอีเมลของคุณ"
                required
                className={styles.input}
              />
            </div>
            
            <div className={styles.description}>
              ระบบจะส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปยังอีเมลของคุณ
            </div>

            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={isLoading || isRateLimited}
            >
              {isLoading ? 'กำลังส่ง...' : 'ส่งลิงก์รีเซ็ตรหัสผ่าน'}
            </button>

            {isRateLimited && rateLimitCountdown > 0 && (
              <div className={styles.rateLimitContainer}>
                <p className={styles.rateLimitText}>
                  กรุณารอ: <span className={styles.rateLimitTimer}>{formatTime(rateLimitCountdown)}</span>
                </p>
              </div>
            )}
          </form>
        ) : (
          <div className={styles.successContainer}>
            <div className={styles.successIcon}>📧</div>
            <h3 className={styles.successTitle}>ส่งอีเมลสำเร็จ!</h3>
            <p className={styles.successMessage}>
              เราได้ส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปยังอีเมล <strong>{email}</strong> แล้ว
            </p>
            <div className={styles.successSteps}>
              <p>📋 ขั้นตอนต่อไป:</p>
              <ol>
                <li>ตรวจสอบอีเมลของคุณ (รวมถึงโฟลเดอร์ Spam)</li>
                <li>คลิกลิงก์ในอีเมลเพื่อรีเซ็ตรหัสผ่าน</li>
                <li>กรอกรหัสผ่านใหม่และยืนยัน</li>
              </ol>
            </div>
            <div className={styles.successNote}>
              <p>💡 <strong>หมายเหตุ:</strong> ลิงก์จะหมดอายุใน 1 ชั่วโมง</p>
            </div>
            
            <div className={styles.resendSection}>
              {countdown > 0 ? (
                <div className={styles.countdownContainer}>
                  <p className={styles.countdownText}>
                    ส่งอีเมลใหม่ได้ใน: <span className={styles.countdownTimer}>{formatTime(countdown)}</span>
                  </p>
                  <button 
                    type="button" 
                    className={styles.resendButtonDisabled}
                    disabled
                  >
                    ส่งอีเมลใหม่
                  </button>
                </div>
              ) : (
                <button 
                  type="button" 
                  className={styles.tryAgainButton}
                  onClick={handleResendEmail}
                  disabled={isLoading || isRateLimited}
                >
                  {isLoading ? 'กำลังส่ง...' : 'ส่งอีเมลใหม่'}
                </button>
              )}
            </div>

            <button 
              type="button" 
              className={styles.backToFormButton}
              onClick={handleTryAgain}
            >
              เปลี่ยนอีเมล
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 