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
import { useState, useEffect } from 'react';
import SettingEditModal from '../../../../../components/SettingEditModal';
import { getSystemSettings, getMonthlyGoalsData } from '../../../../../services/system-setting.service';
import type { SystemSettingResponse, MonthlyGoalsDataResponse } from '../../../../../services/system-setting.service';

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

// ไม่มี mock sales แล้ว ใช้ข้อมูลจริงจาก backend
const SalesChart: FC = () => {
  const [editOpen, setEditOpen] = useState(false);
  const [monthlyGoals, setMonthlyGoals] = useState<number[]>([]);
  const [monthlySales, setMonthlySales] = useState<number[]>([]);
  const [monthlyDue, setMonthlyDue] = useState<number[]>([]); // เพิ่มสถานะสำหรับยอดครบกำหนด
  const [chartData, setChartData] = useState<{
    labels: string[];
    datasets: [
      { label: string; data: number[]; borderColor: string; backgroundColor: string; fill: boolean; },
      { label: string; data: number[]; borderColor: string; borderDash: number[]; fill: boolean; },
      { label: string; data: number[]; borderColor: string; borderDash: number[]; fill: boolean; }
    ];
  }>(() => ({
    labels,
    datasets: [
      {
        label: 'ยอดขาย',
        data: [],
        borderColor: '#0ea5e9',
        backgroundColor: 'rgba(14, 165, 233, 0.1)',
        fill: true,
      },
      {
        label: 'เป้าหมาย',
        data: Array(12).fill(0),
        borderColor: '#94a3b8',
        borderDash: [5, 5],
        fill: false,
      },
      {
        label: 'ยอดครบกำหนด',
        data: Array(12).fill(0),
        borderColor: '#f59e42', // สีส้ม
        backgroundColor: 'rgba(245, 158, 66, 0.18)', // สีส้มอ่อน
        borderDash: [2, 6],
        fill: true,
      }
    ],
  }));

  // คำนวณข้อมูลสรุป
  const totalSales = monthlySales.reduce((a, b) => a + b, 0);
  const averageSales = monthlySales.length ? Math.round(totalSales / monthlySales.length) : 0;
  const maxSales = monthlySales.length ? Math.max(...monthlySales) : 0;
  const minSales = monthlySales.length ? Math.min(...monthlySales) : 0;
  const lastMonthSales = monthlySales[monthlySales.length - 1] ?? 0;
  const previousMonthSales = monthlySales[monthlySales.length - 2] ?? 0;
  const salesChange = ((lastMonthSales - previousMonthSales) / previousMonthSales) * 100;

  // คำนวณเปอร์เซ็นต์ความสำเร็จ
  const targetSales = monthlyGoals.reduce((a, b) => a + b, 0);
  const achievementRate = targetSales ? (totalSales / targetSales) * 100 : 0;

  // คำนวณเดือนที่มีการเติบโตสูงสุด
  const monthlyGrowth = monthlySales.map((value, index, array) => {
    if (index === 0) return 0;
    return ((value - array[index - 1]) / array[index - 1]) * 100;
  });
  const maxGrowthMonth = labels[monthlyGrowth.indexOf(Math.max(...monthlyGrowth))];
  const maxGrowthRate = Math.max(...monthlyGrowth);

  // คำนวณข้อมูลเพิ่มเติม
  const monthsAboveTarget = monthlySales.filter((value, i) => value > (monthlyGoals[i] ?? 0)).length;
  const bestMonth = labels[monthlySales.indexOf(maxSales)] ?? '';
  const worstMonths = monthlySales
    .map((v, i) => v === minSales ? labels[i] : null)
    .filter(Boolean)
    .join(', ');
  const totalGrowth = monthlySales.length ? ((lastMonthSales - monthlySales[0]) / monthlySales[0]) * 100 : 0;

  // ดึงข้อมูลจริงจาก backend
  useEffect(() => {
    // ดึงยอดขายและยอดครบกำหนด
    getMonthlyGoalsData().then((res: MonthlyGoalsDataResponse) => {
      setMonthlySales(res.monthly_sales);
      setMonthlyDue(res.monthly_due); // ใช้ข้อมูลจาก backend
    });
    // ดึงเป้าหมายจาก system settings
    getSystemSettings().then((settings: SystemSettingResponse[]) => {
      const arr: number[] = [];
      for (let i = 1; i <= 12; i++) {
        const found = settings.find(s => s.key === `MonthlyGoals-${i}`);
        if (found && found.value) {
          const val = Number(found.value);
          arr.push(isNaN(val) ? 0 : val);
        } else {
          arr.push(0);
        }
      }
      setMonthlyGoals(arr);
    });
  }, []);

  // อัปเดตเส้นเป้าหมายในกราฟทุกครั้งที่ monthlyGoals เปลี่ยน
  useEffect(() => {
    setChartData(prev => ({
      ...prev,
      datasets: [
        {
          ...prev.datasets[0],
          data: monthlySales.length === 12 ? monthlySales : Array(12).fill(0)
        },
        {
          ...prev.datasets[1],
          data: monthlyGoals.length === 12 ? monthlyGoals : Array(12).fill(0)
        },
        {
          ...prev.datasets[2],
          data: monthlyDue.length === 12 ? monthlyDue : Array(12).fill(0),
          fill: true,
          backgroundColor: 'rgba(245, 158, 66, 0.18)'
        }
      ]
    }));
  }, [monthlySales, monthlyGoals, monthlyDue]);
  const handleEditClick = () => setEditOpen(true);
  // ดึงข้อมูลเป้าหมายรายเดือนใหม่จาก backend หลังบันทึก
  const fetchMonthlyGoals = () => {
    getSystemSettings().then((settings: SystemSettingResponse[]) => {
      const arr: number[] = [];
      for (let i = 1; i <= 12; i++) {
        const found = settings.find(s => s.key === `MonthlyGoals-${i}`);
        if (found && found.value) {
          const val = Number(found.value);
          arr.push(isNaN(val) ? 0 : val);
        } else {
          arr.push(0);
        }
      }
      setMonthlyGoals(arr);
    });
  };

  useEffect(() => {
    fetchMonthlyGoals();
  }, []);

  const handleEditSave = () => {
    fetchMonthlyGoals();
  };

  // ถ้าไม่มีข้อมูลเป้าหมายเลย ให้แสดงข้อความแทนกราฟเป้าหมาย
  if (monthlyGoals.length !== 12) {
    return (
      <div className={styles.chartContainer}>
        <div className={styles.chartHeader}>
          <h2 className={styles.chartTitle}>ยอดขายรายเดือน</h2>
        </div>
        <div style={{textAlign:'center',color:'#64748b',padding:'48px 0',fontSize:'1.1rem'}}>ไม่มีข้อมูลเป้าหมายรายเดือน</div>
        <button type="button" onClick={handleEditClick} style={{margin:'24px auto 0',display:'block',background:'#e0e7ef',color:'#0ea5e9',border:'none',borderRadius:6,padding:'8px 24px',fontWeight:600,cursor:'pointer',fontSize:16}}>
          ตั้งค่าเป้าหมายรายเดือน
        </button>
        <SettingEditModal
          open={editOpen}
          onClose={()=>setEditOpen(false)}
          settings={Array.from({length:12}, (_,i) => ({
            key: `MonthlyGoals-${i+1}`,
            value: monthlyGoals[i] ?? '',
            valueType: 'integer',
            description: `เป้าหมายเดือน ${labels[i]}`
          }))}
          onSave={handleEditSave}
        />
      </div>
    );
  }

  // หาค่าเป้าหมายของเดือนปัจจุบัน
  const thisMonth = new Date().getMonth(); // 0 = ม.ค.
  const thisMonthGoal = monthlyGoals[thisMonth] ?? 0;

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
          <span className={styles.legendItem}>
            <span className={styles.legendColor} style={{ backgroundColor: '#f59e42' }}></span>
            ยอดครบกำหนด
          </span>
        </div>
        <button type="button" onClick={handleEditClick} style={{marginLeft:12,background:'#e0e7ef',color:'#0ea5e9',border:'none',borderRadius:6,padding:'6px 16px',fontWeight:600,cursor:'pointer',fontSize:14}}>
          แก้ไข
        </button>
      </div>
      <div className={styles.chartWrapper}>
        <Line options={options} data={chartData} />
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
              <span className={styles.infoValue}>{worstMonths}</span>
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
              <span className={styles.infoLabel}>เป้าหมายเดือนนี้</span>
              <span className={styles.infoValue}>฿{thisMonthGoal.toLocaleString('th-TH')}</span>
            </div>
          </div>
        </div>
      </div>
      <SettingEditModal
        open={editOpen}
        onClose={()=>setEditOpen(false)}
        settings={Array.from({length:12}, (_,i) => ({
          key: `MonthlyGoals-${i+1}`,
          value: monthlyGoals[i] ?? '',
          valueType: 'integer',
          description: `เป้าหมายเดือน ${labels[i]}`
        }))}
        onSave={handleEditSave}
      />
    </div>
  );
};

export default SalesChart; 