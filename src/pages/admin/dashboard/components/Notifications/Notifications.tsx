import type { FC } from 'react';
import styles from './Notifications.module.css';

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  type: 'error' | 'warning' | 'info';
}

const notifications: Notification[] = [
  {
    id: 1,
    title: 'การชำระเงินล่าช้า',
    message: 'มีลูกค้า 3 รายที่ยังไม่ได้ชำระเงินตามกำหนด',
    time: '5 นาทีที่แล้ว',
    type: 'error',
  },
  {
    id: 2,
    title: 'สินค้าใกล้หมด',
    message: 'iPhone 15 Pro เหลือเพียง 2 เครื่อง',
    time: '10 นาทีที่แล้ว',
    type: 'warning',
  },
  {
    id: 3,
    title: 'ยอดขายเพิ่มขึ้น',
    message: 'ยอดขายวันนี้เพิ่มขึ้น 15% จากเมื่อวาน',
    time: '30 นาทีที่แล้ว',
    type: 'info',
  },
];

const Notifications: FC = () => {
  return (
    <div className={styles.notificationsContainer}>
      <div className={styles.notificationsHeader}>
        <h2 className={styles.notificationsTitle}>การแจ้งเตือน</h2>
        <button className={styles.viewAllButton}>ดูทั้งหมด</button>
      </div>
      <div className={styles.notificationsList}>
        {notifications.map((notification) => (
          <div key={notification.id} className={`${styles.notificationItem} ${styles[notification.type]}`}>
            <div className={styles.notificationIcon}>
              {notification.type === 'error' && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
                </svg>
              )}
              {notification.type === 'warning' && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                </svg>
              )}
              {notification.type === 'info' && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className={styles.notificationContent}>
              <h3 className={styles.notificationTitle}>{notification.title}</h3>
              <p className={styles.notificationMessage}>{notification.message}</p>
              <span className={styles.notificationTime}>{notification.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications; 