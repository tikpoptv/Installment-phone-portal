import type { FC } from 'react';
import styles from './StatsCards.module.css';

interface StatCard {
  id: number;
  title: string;
  value: string;
  change: {
    value: string;
    type: 'increase' | 'decrease' | 'warning';
  };
  description: string;
  type: 'sales' | 'outstanding' | 'orders' | 'customers';
}

const stats: StatCard[] = [
  {
    id: 1,
    title: 'ยอดขายวันนี้',
    value: '฿45,678',
    change: { value: '+12.5%', type: 'increase' },
    description: 'จาก ฿40,590 เมื่อวานนี้',
    type: 'sales',
  },
  {
    id: 2,
    title: 'ยอดค้างชำระรวม',
    value: '฿234,567',
    change: { value: '+5.2%', type: 'warning' },
    description: 'จาก ฿222,900 เมื่อวานนี้',
    type: 'outstanding',
  },
  {
    id: 3,
    title: 'คำสั่งซื้อใหม่',
    value: '24',
    change: { value: '+8.2%', type: 'increase' },
    description: 'จาก 22 เมื่อวานนี้',
    type: 'orders',
  },
  {
    id: 4,
    title: 'ลูกค้าใหม่',
    value: '12',
    change: { value: '+5.7%', type: 'increase' },
    description: 'จาก 11 เมื่อวานนี้',
    type: 'customers',
  },
];

const StatsCards: FC = () => {
  return (
    <div className={styles.statsGrid}>
      {stats.map((stat) => (
        <div key={stat.id} className={`${styles.statCard} ${styles[stat.type]}`}>
          <div className={styles.statIcon}>
            {stat.type === 'sales' && (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 7.5a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" />
                <path fillRule="evenodd" d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v9.75c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 14.625v-9.75zM8.25 9.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM18.75 9a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75V9.75a.75.75 0 00-.75-.75h-.008zM4.5 9.75A.75.75 0 015.25 9h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H5.25a.75.75 0 01-.75-.75V9.75z" clipRule="evenodd" />
                <path d="M2.25 18a.75.75 0 000 1.5c5.4 0 10.63.722 15.6 2.075 1.19.324 2.4-.558 2.4-1.82V18.75a.75.75 0 00-.75-.75H2.25z" />
              </svg>
            )}
            {stat.type === 'outstanding' && (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
              </svg>
            )}
            {stat.type === 'orders' && (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 004.25 22.5h15.5a1.875 1.875 0 001.865-2.071l-1.263-12a1.875 1.875 0 00-1.865-1.679H16.5V6a4.5 4.5 0 10-9 0zM12 3a3 3 0 00-3 3v.75h6V6a3 3 0 00-3-3zm-3 8.25a3 3 0 106 0v-.75a.75.75 0 011.5 0v.75a4.5 4.5 0 11-9 0v-.75a.75.75 0 011.5 0v.75z" clipRule="evenodd" />
              </svg>
            )}
            {stat.type === 'customers' && (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.31 15.117A6.745 6.745 0 0112 12a6.745 6.745 0 016.709 7.498.75.75 0 01-.372.568A12.696 12.696 0 0112 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 01-.372-.568 6.787 6.787 0 011.019-4.38z" clipRule="evenodd" />
                <path d="M5.082 14.254a8.287 8.287 0 00-1.308 5.135 9.687 9.687 0 01-1.764-.44l-.115-.04a.563.563 0 01-.373-.487l-.01-.121a3.75 3.75 0 013.57-4.047zM20.226 19.389a8.287 8.287 0 00-1.308-5.135 3.75 3.75 0 013.57 4.047l-.01.121a.563.563 0 01-.373.486l-.115.04c-.567.2-1.156.349-1.764.441z" />
              </svg>
            )}
          </div>
          <div className={styles.statContent}>
            <div className={styles.statHeader}>
              <h3 className={styles.statTitle}>{stat.title}</h3>
              <span className={`${styles.statChange} ${styles[stat.change.type]}`}>
                {stat.change.value}
              </span>
            </div>
            <p className={styles.statValue}>{stat.value}</p>
            <p className={styles.statDescription}>{stat.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards; 