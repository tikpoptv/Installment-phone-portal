import type { FC } from 'react';
import { useState, useEffect } from 'react';
import Navbar from '../../../components/admin/Navbar';
import LoadingPage from '../../../components/admin/LoadingPage';
import styles from './Dashboard.module.css';
import QuickActions from './components/QuickActions/QuickActions';
import StatsCards from './components/StatsCards/StatsCards';
import SalesChart from './components/SalesChart/SalesChart';
import InventoryStatus from './components/InventoryStatus/InventoryStatus';
import PaymentStatus from './components/PaymentStatus/PaymentStatus';
import TodoList from './components/TodoList/TodoList';
import Notifications from './components/Notifications/Notifications';
import VerifyCustomerModal from './components/VerifyCustomerModal/VerifyCustomerModal';

const Dashboard: FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState<string>('');
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  useEffect(() => {
    // Simulate loading data
    const loadData = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        // ดึง username จาก localStorage
        const userStr = localStorage.getItem('auth_user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setUsername(user.username || '');
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return <LoadingPage text="กำลังโหลดข้อมูลแดชบอร์ด..." />;
  }

  return (
    <div className={styles.dashboard}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div>
              <h1 className={styles.title}>แดชบอร์ด</h1>
              <p className={styles.subtitle}>ยินดีต้อนรับกลับ, <b>{username || 'Admin User'}</b></p>
            </div>
            <div className={styles.dateInfo}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={styles.dateIcon}>
                <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75c2.9 0 5.25 2.35 5.25 5.25v11.25c0 2.9-2.35 5.25-5.25 5.25H5.25c-2.9 0-5.25-2.35-5.25-5.25V9.75C0 6.85 2.35 4.5 5.25 4.5H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clipRule="evenodd" />
              </svg>
              <span className={styles.dateText}>{new Date().toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </div>

        <div className={styles.topSection}>
          <QuickActions onVerifyClick={() => setShowVerifyModal(true)} />
          <StatsCards />
        </div>

        <div className={styles.contentGrid}>
          <div className={styles.mainContent}>
            <SalesChart />
            <InventoryStatus />
          </div>
          <div className={styles.sideContent}>
            <PaymentStatus />
            <TodoList />
            <Notifications />
          </div>
        </div>
      </main>
      {showVerifyModal && (
        <VerifyCustomerModal open={showVerifyModal} onClose={() => setShowVerifyModal(false)} />
      )}
    </div>
  );
};

export default Dashboard; 