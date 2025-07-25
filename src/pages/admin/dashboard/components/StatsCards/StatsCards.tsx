import React from 'react';
import type { FC } from 'react';
import { useState } from 'react';
import styles from './StatsCards.module.css';
import type { DashboardSummary } from '../../../../../services/dashboard.service';
import { formatDateThai, formatDateShort } from '../../../../../utils/date';
import MobileAccessModal from '../../../../../components/MobileAccessModal';
import PaymentDetailModal from '../../../payments/PaymentDetailModal';
import { useMemo } from 'react';

// เพิ่มฟังก์ชันแปลงสถานะเป็นชื่อไทยไว้ด้านบนสุด
function orderStatusLabel(status: string) {
  if (status === 'active') return 'กำลังใช้งาน';
  if (status === 'closed') return 'เสร็จสิ้น';
  if (status === 'pending') return 'รอดำเนินการ';
  if (status === 'repossessed') return 'ยึดคืน';
  if (status === 'returned') return 'คืนสินค้า';
  if (status === 'processing') return 'กำลังดำเนินการ';
  return status;
}

// ฟังก์ชัน normalize date string เป็น YYYY-MM-DD (รองรับ DD/MM/YYYY, YYYY-MM-DD, YYYY-MM-DDTHH:mm:ssZ)
function normalizeDateString(date: string | undefined | null): string | null {
  if (!date) return null;
  if (date.includes('/')) {
    // DD/MM/YYYY
    const [d, m, y] = date.split('/');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return date.split('T')[0];
}

interface StatsCardsProps {
  summary: DashboardSummary | null;
  loading: boolean;
  error: string | null;
}

const StatsCards: FC<StatsCardsProps> = ({ summary, loading, error }) => {
  const [openDetail, setOpenDetail] = useState<null | 'sales' | 'outstanding' | 'orders' | 'customers'>(null);
  const [showMobileWarn, setShowMobileWarn] = useState<null | 'sales' | 'outstanding' | 'orders' | 'customers'>(null);
  const [openPaymentId, setOpenPaymentId] = useState<string | null>(null);

  if (loading) {
    return <div className={styles.statsGrid}>กำลังโหลดข้อมูล...</div>;
  }
  if (error) {
    return <div className={styles.statsGrid} style={{color:'#ef4444'}}>{error}</div>;
  }
  if (!summary) {
    return <div className={styles.statsGrid}>ไม่พบข้อมูล</div>;
  }

  const cards = [
    {
      id: 1,
      title: 'ยอดขายวันนี้',
      value: `฿${summary.sales.today.toLocaleString('th-TH')}`,
      change: {
        value: `${summary.sales.percent_change > 0 ? '+' : ''}${summary.sales.percent_change}%`,
        type: summary.sales.percent_change > 0 ? 'increase' : summary.sales.percent_change < 0 ? 'decrease' : 'warning',
      },
      description: `จาก ฿${summary.sales.yesterday.toLocaleString('th-TH')} เมื่อวานนี้`,
      type: 'sales',
      details: summary.sales.details,
    },
    {
      id: 2,
      title: 'ยอดค้างชำระรวม',
      value: `฿${summary.outstanding.today.toLocaleString('th-TH')}`,
      change: {
        value: `${summary.outstanding.percent_change > 0 ? '+' : ''}${summary.outstanding.percent_change}%`,
        type: summary.outstanding.percent_change > 0 ? 'warning' : summary.outstanding.percent_change < 0 ? 'decrease' : 'increase',
      },
      description: `จาก ฿${summary.outstanding.yesterday.toLocaleString('th-TH')} เมื่อวานนี้`,
      type: 'outstanding',
      details: summary.outstanding.details,
    },
    {
      id: 3,
      title: 'คำสั่งซื้อใหม่',
      value: `${summary.orders.today}`,
      change: {
        value: `${summary.orders.percent_change > 0 ? '+' : ''}${summary.orders.percent_change}%`,
        type: summary.orders.percent_change > 0 ? 'increase' : summary.orders.percent_change < 0 ? 'decrease' : 'warning',
      },
      description: `จาก ${summary.orders.yesterday} เมื่อวานนี้`,
      type: 'orders',
      details: summary.orders.details,
    },
    {
      id: 4,
      title: 'ลูกค้าใหม่',
      value: `${summary.new_customers.today}`,
      change: {
        value: `${summary.new_customers.percent_change > 0 ? '+' : ''}${summary.new_customers.percent_change}%`,
        type: summary.new_customers.percent_change > 0 ? 'increase' : summary.new_customers.percent_change < 0 ? 'decrease' : 'warning',
      },
      description: `จาก ${summary.new_customers.yesterday} เมื่อวานนี้`,
      type: 'customers',
      details: summary.new_customers.details,
    },
  ];

  // ฟังก์ชันเช็คว่าเป็นมือถือหรือไม่
  function isMobileScreen() {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= 640;
  }

  return (
    <>
      <div className={styles.statsGrid}>
        {cards.map((stat) => (
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
              <button className={styles.viewAllButton} 
                onClick={() => {
                  if (isMobileScreen()) {
                    setShowMobileWarn(stat.type as 'sales' | 'outstanding' | 'orders' | 'customers');
                  } else {
                    setOpenDetail(stat.type as 'sales' | 'outstanding' | 'orders' | 'customers');
                  }
                }}>
                ดูรายละเอียด
              </button>
            </div>
          </div>
        ))}
      </div>
      <MobileAccessModal
        open={!!showMobileWarn}
        mode="warn"
        onContinue={() => {
          setOpenDetail(showMobileWarn);
          setShowMobileWarn(null);
        }}
        onCancel={() => setShowMobileWarn(null)}
      />
      {openDetail && (
        <DashboardDetailModal
          type={openDetail}
          summary={summary}
          onClose={() => setOpenDetail(null)}
          onOpenPaymentDetail={setOpenPaymentId}
        />
      )}
      <PaymentDetailModal open={!!openPaymentId} paymentId={openPaymentId} onClose={() => setOpenPaymentId(null)} />
    </>
  );
};

// สร้าง DashboardDetailModal
type ModalProps = {
  type: 'sales' | 'outstanding' | 'orders' | 'customers';
  summary: DashboardSummary;
  onClose: () => void;
  onOpenPaymentDetail?: (paymentId: string) => void;
};
const DashboardDetailModal: FC<ModalProps> = ({ type, summary, onClose, onOpenPaymentDetail }) => {
  let title = '';
  if (type === 'sales') title = 'รายละเอียดยอดขายวันนี้';
  else if (type === 'outstanding') title = 'รายละเอียดยอดค้างชำระ';
  else if (type === 'orders') title = 'รายละเอียดคำสั่งซื้อใหม่';
  else if (type === 'customers') title = 'รายละเอียดลูกค้าใหม่';

  // ฟิลเตอร์วันสำหรับ outstanding
  const [filterStart, setFilterStart] = useState<string>('');
  const [filterEnd, setFilterEnd] = useState<string>('');
  const outstandingDetails = useMemo(() => {
    if (type !== 'outstanding') return summary.outstanding.details;
    if (!filterStart && !filterEnd) return summary.outstanding.details;
    const filterStartNorm = normalizeDateString(filterStart);
    const filterEndNorm = normalizeDateString(filterEnd);
    return summary.outstanding.details.filter(d => {
      const dueDateNorm = normalizeDateString(d.due_date);
      if (!dueDateNorm) return false;
      // เปรียบเทียบ string YYYY-MM-DD ได้เลย
      if (filterStartNorm && !filterEndNorm && dueDateNorm < filterStartNorm) return false;
      if (!filterStartNorm && filterEndNorm && dueDateNorm > filterEndNorm) return false;
      if (filterStartNorm && filterEndNorm && (dueDateNorm < filterStartNorm || dueDateNorm > filterEndNorm)) return false;
      return true;
    });
  }, [type, summary.outstanding.details, filterStart, filterEnd]);

  // ฟังก์ชันช่วยเช็คและแสดง fallback ถ้าไม่มีข้อมูล
  function renderTableOrEmpty(details: unknown[] | undefined, table: React.ReactElement) {
    if (!details || details.length === 0) {
      return <div style={{textAlign:'center',color:'#64748b',padding:'32px 0'}}>ไม่พบข้อมูล</div>;
    }
    return table;
  }

  return (
    <div className={styles.dashboardModalBackdrop}>
      <div className={styles.dashboardModalContent}>
        <button className={styles.dashboardCloseButton} style={{position:'absolute',top:18,right:18,fontSize:24,background:'none',border:'none',cursor:'pointer',width:32,height:32,padding:0}} onClick={onClose}>×</button>
        <h2 className={styles.dashboardModalTitle}>{title}</h2>
        {/* ฟิลเตอร์วันสำหรับ outstanding */}
        {type === 'outstanding' && (
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:18}}>
            <label style={{fontWeight:600,color:'#0ea5e9'}}>ช่วงวันที่ครบกำหนด:</label>
            <input type="date" value={filterStart} onChange={e => setFilterStart(e.target.value)} style={{padding:'6px 10px',borderRadius:6,border:'1.5px solid #bae6fd'}} />
            <span style={{color:'#64748b',fontWeight:600}}>ถึง</span>
            <input type="date" value={filterEnd} onChange={e => setFilterEnd(e.target.value)} style={{padding:'6px 10px',borderRadius:6,border:'1.5px solid #bae6fd'}} />
            {(filterStart || filterEnd) && (
              <button type="button" style={{marginLeft:8,background:'#e0e7ef',color:'#0ea5e9',border:'none',borderRadius:6,padding:'6px 14px',fontWeight:600,cursor:'pointer'}} onClick={()=>{setFilterStart('');setFilterEnd('');}}>ล้าง</button>
            )}
          </div>
        )}
        <div className={styles.dashboardTableWrapper}>
          {type === 'sales' && renderTableOrEmpty(summary.sales.details, (
            <table className={styles.dashboardTable}>
              <thead>
                <tr>
                  <th>วันที่</th>
                  <th>เลขสัญญา</th>
                  <th>ลูกค้า</th>
                  <th>ยอดชำระ (บาท)</th>
                  <th>รหัสชำระ</th>
                </tr>
              </thead>
              <tbody>
                {summary.sales.details && summary.sales.details.map((d, i) => (
                  <tr key={i}>
                    <td>{formatDateShort(d.payment_date)}</td>
                    <td>
                      <a href={`/admin/orders/${d.contract_id}`} target="_blank" rel="noopener noreferrer" style={{color:'#0ea5e9',textDecoration:'underline',fontWeight:600}}>
                        {d.contract_id}
                      </a>
                    </td>
                    <td>{d.user_name}</td>
                    <td>{d.amount.toLocaleString('th-TH')}</td>
                    <td>
                      <button type="button" style={{color:'#0ea5e9',textDecoration:'underline',fontWeight:600,background:'none',border:'none',cursor:'pointer',padding:0}} onClick={() => onOpenPaymentDetail && onOpenPaymentDetail(d.payment_id)}>
                        {d.payment_id}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ))}
          {type === 'outstanding' && renderTableOrEmpty(outstandingDetails, (
            <table className={styles.dashboardTable}>
              <thead>
                <tr>
                  <th style={{minWidth:'120px'}}>เลขสัญญา</th>
                  <th style={{textAlign:'left'}}>ลูกค้า</th>
                  <th style={{minWidth:'120px'}}>ยอดค้างชำระ</th>
                  <th style={{minWidth:'120px'}}>ครบกำหนด</th>
                  <th style={{minWidth:'130px',maxWidth:'160px'}}>จำนวนงวดที่ค้าง</th>
                </tr>
              </thead>
              <tbody>
                {outstandingDetails && outstandingDetails.map((d, i) => (
                  <tr key={i}>
                    <td style={{minWidth:'120px'}}>
                      <a href={`/admin/orders/${d.contract_id}`} target="_blank" rel="noopener noreferrer" style={{color:'#0ea5e9',textDecoration:'underline',fontWeight:600}}>
                        {d.contract_id}
                      </a>
                    </td>
                    <td style={{textAlign:'left'}}>
                      {d.user_name} <span style={{color:'#94a3b8',fontSize:'90%'}}>({d.user_id ? d.user_id : 'ซื้อเงินสด'})</span>
                    </td>
                    <td>{d.outstanding_amount.toLocaleString('th-TH')}</td>
                    <td>{d.due_date ? formatDateShort(d.due_date) : '-'}</td>
                    <td style={{minWidth:'130px',maxWidth:'160px'}}>{typeof d.overdue_count === 'number' ? d.overdue_count : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ))}
          {type === 'orders' && renderTableOrEmpty(summary.orders.details, (
            <table className={styles.dashboardTable}>
              <thead>
                <tr>
                  <th>วันที่</th>
                  <th>เลขสัญญา</th>
                  <th>ลูกค้า</th>
                  <th>ยอดรวม (บาท)</th>
                  <th>สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {summary.orders.details && summary.orders.details.map((d, i) => (
                  <tr key={i}>
                    <td>{formatDateThai(d.created_at)}</td>
                    <td>
                      <a href={`/admin/orders/${d.contract_id}`} target="_blank" rel="noopener noreferrer" style={{color:'#0ea5e9',textDecoration:'underline',fontWeight:600}}>
                        {d.contract_id}
                      </a>
                    </td>
                    <td>{d.user_name}</td>
                    <td>{d.total_price.toLocaleString('th-TH')}</td>
                    <td>{orderStatusLabel(d.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ))}
          {type === 'customers' && renderTableOrEmpty(summary.new_customers.details, (
            <table className={styles.dashboardTable}>
              <thead>
                <tr>
                  <th>วันที่สมัคร</th>
                  <th>รหัสลูกค้า</th>
                  <th>ชื่อ</th>
                  <th>เบอร์โทร</th>
                </tr>
              </thead>
              <tbody>
                {summary.new_customers.details && summary.new_customers.details.map((d, i) => (
                  <tr key={i}>
                    <td>{formatDateThai(d.created_at)}</td>
                    <td>
                      <a href={`/admin/customers/${d.user_id}`} target="_blank" rel="noopener noreferrer" style={{color:'#0ea5e9',textDecoration:'underline',fontWeight:600}}>
                        {d.user_id}
                      </a>
                    </td>
                    <td>{d.user_name}</td>
                    <td>{d.phone_number}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsCards; 