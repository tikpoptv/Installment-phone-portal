import { useState, useEffect } from 'react';
import styles from './PaymentListPage.module.css';
import { getAllPayments } from '../../../services/payment.service';
import type { Payment } from '../../../services/payment.service';
import PaymentCreateModal from './PaymentCreateModal';
import PaymentDetailModal from './PaymentDetailModal';
import { formatDateShort } from '../../../utils/date';
import LoadingSpinner from '../../../components/LoadingSpinner';

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
  // const [search, setSearch] = useState(''); // สำหรับ trigger fetch จริง (ลบทิ้ง)
  const [searchInput, setSearchInput] = useState(''); // สำหรับ input ช่องค้นหา
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 20;
  const [payments, setPayments] = useState<Payment[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState<{search: string; status: string; method: string; startDate: string; endDate: string;}>({search: '', status: 'all', method: 'all', startDate: '', endDate: ''});

  useEffect(() => {
    setLoading(true);
    setError(null);
    getAllPayments({
      page: currentPage,
      limit: rowsPerPage,
      search: searchParams.search,
      status: searchParams.status === 'all' ? undefined : searchParams.status,
      method: searchParams.method === 'all' ? undefined : searchParams.method,
      start_date: searchParams.startDate || undefined,
      end_date: searchParams.endDate || undefined
    })
      .then((data) => {
        const d = data as { items: Payment[]; total: number; total_pages: number };
        setPayments(Array.isArray(d.items) ? d.items : []);
        setTotal(typeof d.total === 'number' ? d.total : 0);
        setTotalPages(typeof d.total_pages === 'number' ? d.total_pages : 1);
      })
      .catch(() => setError('เกิดข้อผิดพลาดในการโหลดข้อมูล'))
      .finally(() => setLoading(false));
  }, [searchParams, currentPage]);

  const totalRows = total;
  const startIdx = (currentPage - 1) * rowsPerPage;
  const endIdx = startIdx + payments.length;
  const paginated = payments;

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>รายการชำระเงิน</h2>
          <div className={styles.actionGroup}>
            <button className={styles.addButton} onClick={() => setShowCreateModal(true)}>+ เพิ่มรายการชำระเงิน</button>
          </div>
        </div>
        <div className={styles.filterRow}>
          <div className={styles.filterTopRow}>
            <input
              type="text"
              placeholder="ค้นหาเลขที่ชำระ, รหัสคำสั่งซื้อ..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className={styles.searchInput}
              style={{ flex: 1, minWidth: 0 }}
            />
            <button
              className={styles.searchButton}
              style={{ marginLeft: 8, minWidth: 80 }}
              onClick={() => {
                setSearchParams({
                  search: searchInput,
                  status: statusFilter,
                  method: methodFilter,
                  startDate,
                  endDate
                });
                setCurrentPage(1);
              }}
            >ค้นหา</button>
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
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 48 }}>
                    <LoadingSpinner text="กำลังโหลดข้อมูล..." />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: '#ef4444', padding: 32 }}>{error}</td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={8} className={styles.centerTextEmpty}>ไม่พบข้อมูล</td></tr>
              ) : paginated.map((p, idx) => (
                <tr key={p.id}>
                  <td className={styles.centerText}>{startIdx + idx + 1}</td>
                  <td>{p.id}</td>
                  <td>{p.contract_id}</td>
                  <td>{formatDateShort(p.payment_date)}</td>
                  <td>{p.amount.toLocaleString('th-TH', {style:'currency',currency:'THB'})}</td>
                  <td>{methodLabel(p.method)}</td>
                  <td>{verifyStatusLabel(p.verify_status)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className={styles.detailButton}
                      onClick={() => {
                        setSelectedPaymentId(p.id);
                        setShowDetailModal(true);
                      }}
                    >
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
        <PaymentCreateModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            setLoading(true);
            getAllPayments({ page: currentPage, limit: rowsPerPage, search: searchParams.search, status: statusFilter === 'all' ? undefined : statusFilter, method: methodFilter === 'all' ? undefined : methodFilter, start_date: startDate, end_date: endDate })
              .then((data) => {
                const d = data as { items: Payment[] };
                setPayments(Array.isArray(d.items) ? d.items : []);
              })
              .catch(() => setError('เกิดข้อผิดพลาดในการโหลดข้อมูล'))
              .finally(() => setLoading(false));
          }}
        />
        <PaymentDetailModal
          open={showDetailModal}
          paymentId={selectedPaymentId}
          onClose={() => setShowDetailModal(false)}
          onActionSuccess={async () => {
            setLoading(true);
            getAllPayments({ page: currentPage, limit: rowsPerPage, search: searchParams.search, status: statusFilter === 'all' ? undefined : statusFilter, method: methodFilter === 'all' ? undefined : methodFilter, start_date: startDate, end_date: endDate })
              .then((data) => {
                const d = data as { items: Payment[] };
                setPayments(Array.isArray(d.items) ? d.items : []);
              })
              .catch(() => setError('เกิดข้อผิดพลาดในการโหลดข้อมูล'))
              .finally(() => setLoading(false));
          }}
        />
      </div>
    </>
  );
} 