import { useNavigate } from 'react-router-dom';
import UserSummary from './components/UserSummary';
import InstallmentList from './components/InstallmentList';
import styles from './Dashboard.module.css';
import { authService } from '../../../services/auth/auth.service';
import React from 'react';

export interface Installment {
  id: string;
  product: string;
  period: string;
  status: string;
  dueDate: string;
  amount: number;
}

const UserDashboard = () => {
  const navigate = useNavigate();

  // ดึงข้อมูล user จาก localStorage (key 'user')
  let userData = null;
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      userData = JSON.parse(userStr);
    } catch { /* ignore */ }
  }
  const user = userData
    ? {
        name: userData.first_name && userData.last_name
          ? `${userData.first_name} ${userData.last_name}`
          : userData.username || '-',
        phone: userData.phone_number || '-',
        balance: 12000 // TODO: ดึงจาก API จริงในอนาคต
      }
    : { name: '-', phone: '-', balance: 12000 };

  const installments: Installment[] = [
    {
      id: '1',
      product: 'iPhone 15',
      period: '2/10',
      status: 'รอชำระ',
      dueDate: '2024-07-10',
      amount: 2500,
    },
    {
      id: '2',
      product: 'Samsung S24',
      period: '5/12',
      status: 'ชำระแล้ว',
      dueDate: '2024-06-01',
      amount: 2200,
    },
  ];

  const handleLogout = () => {
    authService.logout();
    navigate('/user/login');
  };

  return (
    <div className={styles.dashboard}>
      <main className={styles.main}>
        <UserSummary user={user} />
        <InstallmentList installments={installments} />
        <div className={styles.notification}>
          <span className={styles.notificationIcon} role="img" aria-label="alert">⚠️</span>
          งวดที่ 3 ของ iPhone 15 กำลังจะครบกำหนด!
        </div>
        <button className={styles.logoutButton} onClick={handleLogout}>ออกจากระบบ</button>
      </main>
    </div>
  );
};

export default UserDashboard; 