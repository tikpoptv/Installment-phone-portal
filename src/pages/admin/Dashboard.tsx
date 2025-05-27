import type { FC } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import styles from './Dashboard.module.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard: FC = () => {
  const currentDate = new Date().toLocaleDateString('th-TH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const chartData = {
    labels: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.'],
    datasets: [
      {
        label: 'ยอดขาย',
        data: [12, 19, 3, 5, 2, 3],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'ยอดขายรายเดือน',
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: function(value: number | string) {
            if (typeof value === 'number') {
              return `฿${value.toLocaleString()}`;
            }
            return value;
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const notifications = [
    {
      id: 1,
      type: 'error',
      icon: '⚠️',
      title: 'การชำระเงินล้มเหลว',
      time: '10 นาทีที่แล้ว',
      description: 'ไม่สามารถประมวลผลการชำระเงินสำหรับคำสั่งซื้อ #12345',
    },
    {
      id: 2,
      type: 'warning',
      icon: '📦',
      title: 'สินค้าใกล้หมด',
      time: '1 ชั่วโมงที่แล้ว',
      description: 'iPhone 13 Pro Max เหลือเพียง 5 เครื่อง',
    },
    {
      id: 3,
      type: 'info',
      icon: '🎉',
      title: 'โปรโมชั่นใหม่',
      time: '2 ชั่วโมงที่แล้ว',
      description: 'ลดราคาพิเศษสำหรับ iPhone 14 เริ่มต้นที่ ฿24,900',
    },
  ];

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.title}>แดชบอร์ด</h1>
            <p className={styles.subtitle}>ยินดีต้อนรับกลับ, Admin</p>
          </div>
          <div className={styles.dateInfo}>
            <span className={styles.dateIcon}>📅</span>
            <span className={styles.dateText}>{currentDate}</span>
          </div>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.sales}`}>
          <div className={styles.statIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 7.5a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" />
              <path fillRule="evenodd" d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v9.75c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 14.625v-9.75zM8.25 9.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM18.75 9a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75V9.75a.75.75 0 00-.75-.75h-.008zM4.5 9.75A.75.75 0 015.25 9h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H5.25a.75.75 0 01-.75-.75V9.75z" clipRule="evenodd" />
              <path d="M2.25 18a.75.75 0 000 1.5c5.4 0 10.63.722 15.6 2.075 1.19.324 2.4-.558 2.4-1.82V18.75a.75.75 0 00-.75-.75H2.25z" />
            </svg>
          </div>
          <div className={styles.statContent}>
            <div className={styles.statHeader}>
              <h3 className={styles.statTitle}>ยอดขายวันนี้</h3>
              <span className={`${styles.statChange} ${styles.increase}`}>+12.5%</span>
            </div>
            <p className={styles.statValue}>฿45,678</p>
            <p className={styles.statDescription}>จาก ฿40,590 เมื่อวานนี้</p>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.orders}`}>
          <div className={styles.statIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 004.25 22.5h15.5a1.875 1.875 0 001.865-2.071l-1.263-12a1.875 1.875 0 00-1.865-1.679H16.5V6a4.5 4.5 0 10-9 0zM12 3a3 3 0 00-3 3v.75h6V6a3 3 0 00-3-3zm-3 8.25a3 3 0 106 0v-.75a.75.75 0 011.5 0v.75a4.5 4.5 0 11-9 0v-.75a.75.75 0 011.5 0v.75z" clipRule="evenodd" />
            </svg>
          </div>
          <div className={styles.statContent}>
            <div className={styles.statHeader}>
              <h3 className={styles.statTitle}>คำสั่งซื้อใหม่</h3>
              <span className={`${styles.statChange} ${styles.increase}`}>+8.2%</span>
            </div>
            <p className={styles.statValue}>24</p>
            <p className={styles.statDescription}>จาก 22 เมื่อวานนี้</p>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.customers}`}>
          <div className={styles.statIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.31 15.117A6.745 6.745 0 0112 12a6.745 6.745 0 016.709 7.498.75.75 0 01-.372.568A12.696 12.696 0 0112 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 01-.372-.568 6.787 6.787 0 011.019-4.38z" clipRule="evenodd" />
              <path d="M5.082 14.254a8.287 8.287 0 00-1.308 5.135 9.687 9.687 0 01-1.764-.44l-.115-.04a.563.563 0 01-.373-.487l-.01-.121a3.75 3.75 0 013.57-4.047zM20.226 19.389a8.287 8.287 0 00-1.308-5.135 3.75 3.75 0 013.57 4.047l-.01.121a.563.563 0 01-.373.486l-.115.04c-.567.2-1.156.349-1.764.441z" />
            </svg>
          </div>
          <div className={styles.statContent}>
            <div className={styles.statHeader}>
              <h3 className={styles.statTitle}>ลูกค้าใหม่</h3>
              <span className={`${styles.statChange} ${styles.increase}`}>+5.7%</span>
            </div>
            <p className={styles.statValue}>12</p>
            <p className={styles.statDescription}>จาก 11 เมื่อวานนี้</p>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.conversion}`}>
          <div className={styles.statIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M2.25 13.5a8.25 8.25 0 018.25-8.25.75.75 0 01.75.75v6.75H18a.75.75 0 01.75.75 8.25 8.25 0 01-16.5 0z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M12.75 3a.75.75 0 01.75-.75 8.25 8.25 0 018.25 8.25.75.75 0 01-.75.75h-7.5a.75.75 0 01-.75-.75V3z" clipRule="evenodd" />
            </svg>
          </div>
          <div className={styles.statContent}>
            <div className={styles.statHeader}>
              <h3 className={styles.statTitle}>อัตราการแปลง</h3>
              <span className={`${styles.statChange} ${styles.decrease}`}>-2.3%</span>
            </div>
            <p className={styles.statValue}>3.2%</p>
            <p className={styles.statDescription}>จาก 3.5% เมื่อวานนี้</p>
          </div>
        </div>
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.chartCard}>
          <Line data={chartData} options={chartOptions} />
        </div>

        <div className={styles.notificationCard}>
          <h2 className={styles.notificationTitle}>การแจ้งเตือนล่าสุด</h2>
          <div className={styles.notificationList}>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`${styles.notificationItem} ${
                  styles[notification.type]
                }`}
              >
                <div className={styles.notificationIcon}>{notification.icon}</div>
                <div className={styles.notificationContent}>
                  <div className={styles.notificationHeader}>
                    <h3 className={styles.notificationItemTitle}>
                      {notification.title}
                    </h3>
                    <span className={styles.notificationTime}>
                      {notification.time}
                    </span>
                  </div>
                  <p className={styles.notificationDescription}>
                    {notification.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 