import type { FC } from 'react';
import { useState, useEffect } from 'react';
import Navbar from '../../../components/admin/Navbar';
import LoadingPage from '../../../components/admin/LoadingPage';
import styles from './Orders.module.css';

const Orders: FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const loadData = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading orders data:', error);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return <LoadingPage text="กำลังโหลดข้อมูลคำสั่งซื้อ..." />;
  }

  return (
    <div className={styles.orders}>
      <Navbar />
      <main className={styles.main}>
        {/* Orders content */}
      </main>
    </div>
  );
};

export default Orders; 