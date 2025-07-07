import { useState } from 'react';
import styles from './PaymentListPage.module.css';

const mockPayments = [
  {
    id: 'PM00001',
    contract_id: 'CT00001',
    payment_date: '2024-07-15',
    amount: 2000.0,
    method: 'bank_transfer',
    verify_status: 'pending',
    created_at: '2024-07-15T12:00:00Z',
  },
  {
    id: 'PM00002',
    contract_id: 'CT00002',
    payment_date: '2024-07-20',
    amount: 1500.0,
    method: 'cash',
    verify_status: 'approved',
    created_at: '2024-07-20T12:00:00Z',
  },
];

const statusOptions = [
  { value: 'all', label: 'ทุกสถานะ' },
  { value: 'pending', label: 'รอตรวจสอบ' },
  { value: 'approved', label: 'อนุมัติ' },
  { value: 'rejected', label: 'ไม่อนุมัติ' },
];
const methodOptions = [
  { value: 'all', label: 'ทุกวิธีชำระ' },
  { value: 'bank_transfer', label: 'โอนเงิน' },
  { value: 'cash', label: 'เงินสด' },
];

const methodLabel = (method: string) => {
  if (method === 'bank_transfer') return 'โอนเงิน';
  if (method === 'cash') return 'เงินสด';
  return method;
};

const verifyStatusLabel = (status: string) => {
  if (status === 'pending') return <span className={styles.statusPending}>รอตรวจสอบ</span>;
  if (status === 'approved') return <span className={styles.statusApproved}>อนุมัติ</span>;
  if (status === 'rejected') return <span className={styles.statusRejected}>ไม่อนุมัติ</span>;
  return status;
};

export default function PaymentListPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 20;

  const filtered = mockPayments.filter(p => {
    const matchSearch =
      p.id.includes(search) ||
      p.contract_id.includes(search);
    const matchStatus = statusFilter === 'all' || p.verify_status === statusFilter;
    const matchMethod = methodFilter === 'all' || p.method === methodFilter;
    const matchStart = !startDate || p.payment_date >= startDate;
    const matchEnd = !endDate || p.payment_date <= endDate;
    return matchSearch && matchStatus && matchMethod && matchStart && matchEnd;
  });

  const totalRows = filtered.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;
  const startIdx = (currentPage - 1) * rowsPerPage;
  const endIdx = startIdx + rowsPerPage;
  const paginated = filtered.slice(startIdx, endIdx);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>รายการชำระเงิน</h2>
        <div className={styles.actionGroup}>
          {/* <button className={styles.addButton}>เพิ่มชำระเงิน</button> */}
        </div>
      </div>
      <div className={styles.filterRow}>
        <div className={styles.filterTopRow}>
          <input
            type="text"
            placeholder="ค้นหาเลขที่ชำระ, รหัสคำสั่งซื้อ..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={styles.searchInput}
            style={{ flex: 1, minWidth: 0 }}
          />
        </div>
        <div className={styles.filterRightRow}>
          <div className={styles.filterRightGroup}>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className={styles.select}
              style={{ minWidth: 120 }}
              placeholder="วันที่เริ่มต้น"
            />
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className={styles.select}
              style={{ minWidth: 120 }}
              placeholder="วันที่สิ้นสุด"
            />
          </div>
          <div className={styles.filterLeftGroup}>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className={styles.select}
              style={{ minWidth: 140 }}
            >
              {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <select
              value={methodFilter}
              onChange={e => setMethodFilter(e.target.value)}
              className={styles.select}
              style={{ minWidth: 140 }}
            >
              {methodOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        </div>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ลำดับ</th>
              <th>เลขที่ชำระ</th>
              <th>รหัสคำสั่งซื้อ</th>
              <th>วันที่ชำระ</th>
              <th>จำนวนเงิน</th>
              <th>วิธีชำระ</th>
              <th>สถานะ</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr><td colSpan={8} className={styles.centerTextEmpty}>ไม่พบข้อมูล</td></tr>
            ) : paginated.map((p, idx) => (
              <tr key={p.id}>
                <td className={styles.centerText}>{startIdx + idx + 1}</td>
                <td>{p.id}</td>
                <td>{p.contract_id}</td>
                <td>{p.payment_date}</td>
                <td>{p.amount.toLocaleString('th-TH', {style:'currency',currency:'THB'})}</td>
                <td>{methodLabel(p.method)}</td>
                <td>{verifyStatusLabel(p.verify_status)}</td>
                <td style={{ textAlign: 'center' }}>
                  <button className={styles.detailButton}>
                    ดูรายละเอียด
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.paginationBar}>
        <span>แสดง {totalRows === 0 ? 0 : startIdx + 1}-{Math.min(endIdx, totalRows)} จาก {totalRows} รายการ</span>
        <div className={styles.paginationControls}>
          <button
            className={styles.paginationButton}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >ย้อนกลับ</button>
          <span>หน้า {currentPage} / {totalPages}</span>
          <button
            className={styles.paginationButton}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >ถัดไป</button>
        </div>
      </div>
    </div>
  );
} 