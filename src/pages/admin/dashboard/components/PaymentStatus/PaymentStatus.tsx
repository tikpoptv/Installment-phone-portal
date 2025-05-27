import type { FC } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import styles from './PaymentStatus.module.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        padding: 20,
        usePointStyle: true,
        pointStyle: 'circle',
      },
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      titleColor: '#1e293b',
      bodyColor: '#64748b',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      padding: 12,
      boxPadding: 6,
      usePointStyle: true,
      callbacks: {
        label: function(context: any) {
          const label = context.label || '';
          const value = context.parsed || 0;
          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
          const percentage = Math.round((value / total) * 100);
          return `${label}: ${percentage}%`;
        }
      }
    }
  },
  cutout: '70%',
};

const data = {
  labels: ['ชำระแล้ว', 'ค้างชำระ'],
  datasets: [
    {
      data: [75, 25],
      backgroundColor: ['#10b981', '#ef4444'],
      borderWidth: 0,
    },
  ],
};

const PaymentStatus: FC = () => {
  return (
    <div className={styles.paymentContainer}>
      <div className={styles.paymentHeader}>
        <h2 className={styles.paymentTitle}>สถานะการชำระเงิน</h2>
      </div>
      <div className={styles.chartWrapper}>
        <Pie options={options} data={data} />
      </div>
      <div className={styles.paymentStats}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>ชำระแล้ว</span>
          <span className={styles.statValue}>75%</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>ค้างชำระ</span>
          <span className={styles.statValue}>25%</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatus; 