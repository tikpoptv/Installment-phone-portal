import type { FC } from 'react';
import styles from './InventoryStatus.module.css';

interface InventoryItem {
  id: number;
  name: string;
  stock: number;
  status: 'warning' | 'error' | 'normal';
}

const inventoryItems: InventoryItem[] = [
  {
    id: 1,
    name: 'iPhone 15 Pro Max',
    stock: 5,
    status: 'normal',
  },
  {
    id: 2,
    name: 'iPhone 15 Pro',
    stock: 2,
    status: 'warning',
  },
  {
    id: 3,
    name: 'iPhone 15 Plus',
    stock: 0,
    status: 'error',
  },
  {
    id: 4,
    name: 'iPhone 15',
    stock: 8,
    status: 'normal',
  },
];

const InventoryStatus: FC = () => {
  return (
    <div className={styles.inventoryContainer}>
      <div className={styles.inventoryHeader}>
        <h2 className={styles.inventoryTitle}>สถานะสินค้า</h2>
        <button className={styles.viewAllButton}>ดูทั้งหมด</button>
      </div>
      <div className={styles.inventoryList}>
        {inventoryItems.map((item) => (
          <div key={item.id} className={`${styles.inventoryItem} ${styles[item.status]}`}>
            <div className={styles.itemInfo}>
              <h3 className={styles.itemName}>{item.name}</h3>
              <span className={styles.itemStock}>คงเหลือ: {item.stock} ชิ้น</span>
            </div>
            <div className={styles.itemStatus}>
              {item.status === 'warning' && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={styles.statusIcon}>
                  <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                </svg>
              )}
              {item.status === 'error' && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={styles.statusIcon}>
                  <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
                </svg>
              )}
              {item.status === 'normal' && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={styles.statusIcon}>
                  <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InventoryStatus; 