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
  Filler,
  Scale,
} from 'chart.js';
import type { CoreScaleOptions } from 'chart.js';
import styles from './SalesChart.module.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const options = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      mode: 'index' as const,
      intersect: false,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      titleColor: '#1e293b',
      bodyColor: '#64748b',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      padding: 12,
      boxPadding: 6,
      usePointStyle: true,
      callbacks: {
        label: function(context: { parsed: { y: number } }) {
          return `฿${context.parsed.y.toLocaleString()}`;
        }
      }
    }
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: '#64748b',
      }
    },
    y: {
      grid: {
        color: '#f1f5f9',
      },
      ticks: {
        color: '#64748b',
        callback: function(this: Scale<CoreScaleOptions>, tickValue: number | string) {
          return '฿' + Number(tickValue).toLocaleString();
        }
      }
    }
  },
  interaction: {
    mode: 'nearest' as const,
    axis: 'x' as const,
    intersect: false
  },
  elements: {
    line: {
      tension: 0.4,
      borderWidth: 2,
    },
    point: {
      radius: 4,
      hoverRadius: 6,
    }
  }
};

const labels = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

const data = {
  labels,
  datasets: [
    {
      label: 'ยอดขาย',
      data: [45000, 52000, 48000, 58000, 62000, 55000, 68000, 72000, 65000, 75000, 82000, 90000],
      borderColor: '#0ea5e9',
      backgroundColor: 'rgba(14, 165, 233, 0.1)',
      fill: true,
    },
    {
      label: 'เป้าหมาย',
      data: [50000, 50000, 50000, 50000, 50000, 50000, 50000, 50000, 50000, 50000, 50000, 50000],
      borderColor: '#94a3b8',
      borderDash: [5, 5],
      fill: false,
    }
  ],
};

const SalesChart: FC = () => {
  // คำนวณข้อมูลสรุป
  const totalSales = data.datasets[0].data.reduce((a, b) => a + b, 0);
  const averageSales = Math.round(totalSales / data.datasets[0].data.length);
  const maxSales = Math.max(...data.datasets[0].data);
  const minSales = Math.min(...data.datasets[0].data);
  const lastMonthSales = data.datasets[0].data[data.datasets[0].data.length - 1];
  const previousMonthSales = data.datasets[0].data[data.datasets[0].data.length - 2];
  const salesChange = ((lastMonthSales - previousMonthSales) / previousMonthSales) * 100;

  // คำนวณเปอร์เซ็นต์ความสำเร็จ
  const targetSales = 50000 * 12; // เป้าหมายต่อเดือน * 12 เดือน
  const achievementRate = (totalSales / targetSales) * 100;

  // คำนวณเดือนที่มีการเติบโตสูงสุด
  const monthlyGrowth = data.datasets[0].data.map((value, index, array) => {
    if (index === 0) return 0;
    return ((value - array[index - 1]) / array[index - 1]) * 100;
  });
  const maxGrowthMonth = labels[monthlyGrowth.indexOf(Math.max(...monthlyGrowth))];
  const maxGrowthRate = Math.max(...monthlyGrowth);

  // คำนวณข้อมูลเพิ่มเติม
  const monthsAboveTarget = data.datasets[0].data.filter(value => value > 50000).length;
  const bestMonth = labels[data.datasets[0].data.indexOf(maxSales)];
  const worstMonth = labels[data.datasets[0].data.indexOf(minSales)];
  const totalGrowth = ((lastMonthSales - data.datasets[0].data[0]) / data.datasets[0].data[0]) * 100;

  return (
    <div className={styles.chartContainer}>
      <div className={styles.chartHeader}>
        <h2 className={styles.chartTitle}>ยอดขายรายเดือน</h2>
        <div className={styles.chartLegend}>
          <span className={styles.legendItem}>
            <span className={styles.legendColor} style={{ backgroundColor: '#0ea5e9' }}></span>
            ยอดขาย
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendColor} style={{ backgroundColor: '#94a3b8' }}></span>
            เป้าหมาย
          </span>
        </div>
      </div>
      <div className={styles.chartWrapper}>
        <Line options={options} data={data} />
      </div>
      <div className={styles.chartSummary}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>ยอดขายรวม</span>
          <span className={styles.summaryValue}>฿{totalSales.toLocaleString()}</span>
          <span className={`${styles.summaryChange} ${salesChange >= 0 ? styles.increase : styles.decrease}`}>
            {salesChange >= 0 ? '↑' : '↓'} {Math.abs(salesChange).toFixed(1)}%
          </span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>ความสำเร็จ</span>
          <span className={styles.summaryValue}>{achievementRate.toFixed(1)}%</span>
          <span className={styles.summaryLabel}>ของเป้าหมาย</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>เติบโตสูงสุด</span>
          <span className={styles.summaryValue}>{maxGrowthRate.toFixed(1)}%</span>
          <span className={styles.summaryLabel}>เดือน{maxGrowthMonth}</span>
        </div>
      </div>
      <div className={styles.additionalInfo}>
        <div className={styles.infoCard}>
          <div className={styles.infoHeader}>
            <span className={styles.infoIcon}>📈</span>
            <span className={styles.infoTitle}>สรุปการเติบโต</span>
          </div>
          <div className={styles.infoContent}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>เติบโตทั้งปี</span>
              <span className={styles.infoValue}>{totalGrowth.toFixed(1)}%</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>เดือนที่ดีที่สุด</span>
              <span className={styles.infoValue}>{bestMonth}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>เดือนที่ต่ำที่สุด</span>
              <span className={styles.infoValue}>{worstMonth}</span>
            </div>
          </div>
        </div>
        <div className={styles.infoCard}>
          <div className={styles.infoHeader}>
            <span className={styles.infoIcon}>📅</span>
            <span className={styles.infoTitle}>เป้าหมายรายเดือน</span>
          </div>
          <div className={styles.infoContent}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>ทำได้เกินเป้า</span>
              <span className={styles.infoValue}>{monthsAboveTarget} เดือน</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>ยอดขายเฉลี่ย</span>
              <span className={styles.infoValue}>฿{averageSales.toLocaleString()}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>เป้าหมายต่อเดือน</span>
              <span className={styles.infoValue}>฿50,000</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesChart; 