import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import PrivacyPolicyModal from '../../../components/PrivacyPolicyModal';
import PendingApprovalModal from '../../../components/PendingApprovalModal';
import ForgotPasswordModal from './ForgotPasswordModal';
import { authService } from '../../../services/auth/auth.service';

function UserLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // เรียก service loginUser
      const data = await authService.loginUser(formData.phone, formData.password);
      // เก็บ token และ user ใน localStorage แล้ว navigate
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('expires_in', data.expires_in.toString());
      navigate('/user');
    } catch (err: unknown) {
      let msg = 'เกิดข้อผิดพลาด';
      if (err && typeof err === 'object' && 'message' in err && typeof (err as { message?: unknown }).message === 'string') {
        msg = (err as { message: string }).message;
      } else if (err && typeof err === 'object' && 'error' in err && typeof (err as { error?: unknown }).error === 'string') {
        msg = (err as { error: string }).error;
      } else {
        msg = JSON.stringify(err);
      }
      if (msg === 'คุณต้องรอยืนยันตัวตน') {
        setShowPendingModal(true);
      } else {
        setError(msg);
      }
    }
  };

  const handleRegisterClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setShowPrivacyPolicy(true);
  };

  const handlePrivacyPolicyAccept = () => {
    setShowPrivacyPolicy(false);
    localStorage.setItem('accept_privacy_policy', 'yes');
    navigate('/user/register');
  };

  const handleForgotPasswordClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setShowForgotPasswordModal(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <h1 className={styles.title}>เข้าสู่ระบบ</h1>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="phone">เบอร์โทรศัพท์</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              pattern="[0-9]{10}"
              placeholder="0812345678"
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password">รหัสผ่าน</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className={styles.submitButton}>
            เข้าสู่ระบบ
          </button>
          <div className={styles.forgotPasswordLink}>
            <a href="/forgot-password" onClick={handleForgotPasswordClick}>ลืมรหัสผ่าน?</a>
          </div>
          <div className={styles.registerLink}>
            ยังไม่มีบัญชี? <a href="/user/register" onClick={handleRegisterClick}>สมัครสมาชิก</a>
          </div>
        </form>
      </div>

      {/* Modal แจ้งเตือนรอแอดมินยืนยันตัวตน */}
      <PendingApprovalModal isOpen={showPendingModal} onClose={() => setShowPendingModal(false)} />

      {/* Modal ลืมรหัสผ่าน */}
      <ForgotPasswordModal 
        isOpen={showForgotPasswordModal} 
        onClose={() => setShowForgotPasswordModal(false)} 
      />

      <PrivacyPolicyModal
        isOpen={showPrivacyPolicy}
        onClose={() => setShowPrivacyPolicy(false)}
        onAccept={handlePrivacyPolicyAccept}
      />
    </div>
  );
}

export default UserLogin; 