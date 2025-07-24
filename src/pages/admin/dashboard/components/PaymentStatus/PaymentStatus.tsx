import type { FC } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import type { TooltipItem } from 'chart.js';
import styles from './PaymentStatus.module.css';
import { useState, useEffect } from 'react';
import { getPaymentStatusSummary } from '../../../../../services/payment.service';
import type { PaymentStatusSummaryItem } from '../../../../../services/payment.service';

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
        label: function(context: TooltipItem<'pie'>) {
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

const labels = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

const PaymentStatus: FC = () => {
  const [periodType, setPeriodType] = useState<'all'|'custom'>('custom');
  const [customMonth, setCustomMonth] = useState<number>(new Date().getMonth()); // 0 = ม.ค.
  const thisMonth = new Date().getMonth(); // 0 = ม.ค.
  const [summary, setSummary] = useState<PaymentStatusSummaryItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const year = new Date().getFullYear();
    let monthsParam = 'ALL';
    if (periodType === 'custom') {
      monthsParam = (customMonth + 1).toString(); // เดือนใน API เริ่มที่ 1
    }
    setLoading(true);
    getPaymentStatusSummary({ year, months: monthsParam })
      .then((res: { payment_status_summary: PaymentStatusSummaryItem[] }) => setSummary(res.payment_status_summary))
      .finally(() => setLoading(false));
  }, [periodType, customMonth]);

  // เตรียมข้อมูลสำหรับ Pie Chart
  const paid = summary.find(s => s.status === 'paid')?.amount ?? 0;
  const unpaid = summary.find(s => s.status === 'unpaid')?.amount ?? 0;
  const partial = summary.find(s => s.status === 'partial')?.amount ?? 0;
  const advancePaid = summary.find(s => s.status === 'advance_paid')?.amount ?? 0;
  const total = paid + unpaid + partial + advancePaid;

  // เงื่อนไขแสดง advancePaid เฉพาะ ALL หรือเดือนปัจจุบัน
  const showAdvancePaid = periodType === 'all' || customMonth === thisMonth;

  const pieData = {
    labels: showAdvancePaid
      ? ['ชำระแล้ว', 'ค้างชำระ', 'จ่ายบางส่วน', 'จ่ายล่วงหน้า']
      : ['ชำระแล้ว', 'ค้างชำระ', 'จ่ายบางส่วน'],
    datasets: [
      {
        data: showAdvancePaid
          ? [paid, unpaid, partial, advancePaid]
          : [paid, unpaid, partial],
        backgroundColor: showAdvancePaid
          ? ['#10b981', '#ef4444', '#f59e42', '#6366f1']
          : ['#10b981', '#ef4444', '#f59e42'],
        borderWidth: 0,
      },
    ],
  };

  // เปอร์เซ็นต์แต่ละสถานะ
  const percent = (val: number) => total ? Math.round((val / total) * 100) : 0;

  return (
    <div className={styles.paymentContainer}>
      <div className={styles.paymentHeader}>
        <h2 className={styles.paymentTitle}>สถานะการชำระเงิน</h2>
      </div>
      <div className={styles.chartWrapper}>
        {loading ? (
          <div>กำลังโหลด...</div>
        ) : total === 0 ? (
          <div style={{textAlign:'center',color:'#64748b',padding:'48px 0',fontSize:'1.1rem'}}>ไม่พบข้อมูล</div>
        ) : (
          <Pie options={options} data={pieData} />
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <button
          type="button"
          className={periodType === 'all' ? styles.activePeriodBtn : styles.periodBtn}
          onClick={() => setPeriodType('all')}
        >ทั้งหมด</button>
        <select
          className={periodType === 'custom' ? styles.activePeriodBtn : styles.periodBtn}
          value={customMonth}
          onChange={e => { setPeriodType('custom'); setCustomMonth(Number(e.target.value)); }}
          style={{ marginLeft: 4 }}
        >
          {labels.slice(0, thisMonth + 1).map((label, idx) => (
            <option key={idx} value={idx}>{label}</option>
          ))}
        </select>
      </div>
      <div className={styles.paymentStats}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>ชำระแล้ว</span>
          <span className={styles.statValue}>{percent(paid)}%</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>ค้างชำระ</span>
          <span className={styles.statValue}>{percent(unpaid)}%</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>จ่ายบางส่วน</span>
          <span className={styles.statValue}>{percent(partial)}%</span>
        </div>
        {showAdvancePaid && (
          <div className={styles.statItem}>
            <span className={styles.statLabel}>จ่ายล่วงหน้า</span>
            <span className={styles.statValue}>{percent(advancePaid)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentStatus; 