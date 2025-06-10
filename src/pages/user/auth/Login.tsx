import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';

function UserLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  });
  const [error, setError] = useState('');

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
      // TODO: เรียก API login สำหรับ user
      const response = await fetch('/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('เข้าสู่ระบบไม่สำเร็จ');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      navigate('/user');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    }
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
        </form>
      </div>
    </div>
  );
}

export default UserLogin; 