import { useState, useEffect } from 'react';
import styles from './OrderListPage.module.css';
import { useNavigate } from 'react-router-dom';
import MobileAccessModal from '../../../components/MobileAccessModal';
import { getContracts } from '../../../services/contract.service';
import type { Contract } from '../../../services/contract.service';
import OrderCreateModal from './OrderCreateModal';
import { formatDateThai } from '../../../utils/date';

const statusLabel = (status: string) => {
  if (status === 'active') return <span className={styles.statusActive}>ใช้งานอยู่</span>;
  if (status === 'completed') return <span className={styles.statusCompleted}>เสร็จสิ้น</span>;
  if (status === 'cancelled') return <span className={styles.statusCancelled}>ยกเลิก</span>;
  return <span className={styles.statusDefault}>{status}</span>;
};

const categoryLabel = (cat: string) => {
  if (cat === 'rent' || cat === 'installment') return 'ผ่อน';
  if (cat === 'cash_purchase' || cat === 'full') return 'ซื้อเงินสด';
  return cat;
};

const statusOptions = [
  { value: 'all', label: 'ทุกสถานะ' },
  { value: 'active', label: 'ใช้งานอยู่' },
  { value: 'completed', label: 'เสร็จสิ้น' },
  { value: 'cancelled', label: 'ยกเลิก' },
];
const categoryOptions = [
  { value: 'all', label: 'ทุกประเภท' },
  { value: 'rent', label: 'เช่า' },
  { value: 'installment', label: 'ผ่อน' },
  { value: 'full', label: 'ซื้อขาด' },
];

function exportOrdersToCSV(orders: Contract[]) {
  const header = ['ลำดับ', 'รหัสคำสั่งซื้อ', 'ลูกค้า', 'สินค้า', 'ประเภท', 'ยอดรวม', 'สถานะ', 'วันที่เริ่ม', 'วันที่สิ้นสุด', 'วันที่สร้าง'];
  const rows = orders.map((o, idx) => [
    idx + 1,
    o.id,
    o.user_name,
    o.product_name,
    categoryLabel(o.category),
    o.total_price,
    o.status,
    o.start_date,
    o.end_date,
    o.created_at,
  ]);
  const csvContent = [header, ...rows]
    .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    .join('\r\n');
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'order-list.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function ExportModal({ open, onClose, onExportFiltered, onExportAll }: {
  open: boolean;
  onClose: () => void;
  onExportFiltered: () => void;
  onExportAll: () => void;
}) {
  if (!open) return null;
  return (
    <div className={styles.exportModalContainer}>
      <button
        onClick={onClose}
        className={styles.closeButton}
        aria-label="ปิด"
      >
        <span className={styles.closeIcon}>×</span>
      </button>
      <div className={styles.exportModalContent}>
        <div className={styles.exportModalTitle}>Export ข้อมูลคำสั่งซื้อ</div>
        <div className={styles.exportModalMessage}>คุณต้องการ export ข้อมูลคำสั่งซื้อแบบไหน?</div>
        <div className={styles.exportModalButtons}>
          <button className={styles.exportButton} onClick={() => { onExportFiltered(); onClose(); }}>เฉพาะข้อมูลที่แสดงอยู่</button>
          <button className={styles.exportButton} onClick={() => { onExportAll(); onClose(); }}>ข้อมูลทั้งหมด</button>
        </div>
      </div>
    </div>
  );
}

export default function OrderListPage() {
  const [orders, setOrders] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [showMobileWarn, setShowMobileWarn] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getContracts()
      .then(data => {
        setOrders(data ?? []);
        setLoading(false);
        setFetchError(null);
      })
      .catch(() => {
        setFetchError('เกิดข้อผิดพลาดในการโหลดข้อมูลคำสั่งซื้อ');
        setLoading(false);
      });
  }, []);

  // สร้างรายการสินค้าไม่ซ้ำสำหรับ filter
  const productNames = Array.from(new Set(orders.map(o => o.product_name)));

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.id.includes(search) ||
      o.user_name.includes(search) ||
      o.product_name.includes(search);
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchCategory = categoryFilter === 'all' || o.category === categoryFilter;
    const matchProduct = !productFilter || o.product_name === productFilter;
    const matchStart = !startDate || o.start_date >= startDate;
    const matchEnd = !endDate || o.end_date <= endDate;
    return matchSearch && matchStatus && matchCategory && matchProduct && matchStart && matchEnd;
  });

  const totalRows = filtered.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;
  const startIdx = (currentPage - 1) * rowsPerPage;
  const endIdx = startIdx + rowsPerPage;
  const paginated = filtered.slice(startIdx, endIdx);

  useEffect(() => { setCurrentPage(1); }, [search, rowsPerPage, statusFilter, categoryFilter, productFilter, startDate, endDate]);

  // ตรวจสอบขนาดหน้าจอเมื่อ mount
  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth <= 640) {
        setShowMobileWarn(true);
      }
    };
    checkMobile();
  }, []);

  if (loading) {
    return <div className={styles.loadingMessage}>กำลังโหลดข้อมูล...</div>;
  }
  if (fetchError) {
    return <div className={styles.errorText}>{fetchError}</div>;
  }
  if (!orders) {
    return <div className={styles.centerTextEmpty}>ไม่มีข้อมูลคำสั่งซื้อ</div>;
  }

  return (
    <>
      <MobileAccessModal
        open={showMobileWarn}
        mode="warn"
        onContinue={() => setShowMobileWarn(false)}
        onCancel={() => navigate(-1)}
      />
      <OrderCreateModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} />
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>รายการคำสั่งซื้อ</h2>
          <div className={styles.actionGroup}>
            <button className={styles.addButton} onClick={() => setCreateModalOpen(true)}>สร้างคำสั่งซื้อ</button>
            <button className={styles.exportButton} onClick={() => setExportModalOpen(true)}>Export</button>
          </div>
        </div>
        <div className={styles.filterRow}>
          <div className={styles.filterTopRow}>
            <input
              type="text"
              placeholder="ค้นหาชื่อลูกค้า, สินค้า, รหัสคำสั่งซื้อ..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={styles.searchInput}
              style={{ flex: 1, minWidth: 0 }}
            />
            <select
              value={rowsPerPage}
              onChange={e => setRowsPerPage(Number(e.target.value))}
              className={styles.select}
              style={{ marginLeft: 12, minWidth: 160 }}
            >
              <option value={25}>25 รายการ/หน้า</option>
              <option value={50}>50 รายการ/หน้า</option>
              <option value={75}>75 รายการ/หน้า</option>
              <option value={100}>100 รายการ/หน้า</option>
            </select>
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
                style={{ minWidth: 120 }}
              >
                {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className={styles.select}
                style={{ minWidth: 120 }}
              >
                {categoryOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
              <select
                value={productFilter}
                onChange={e => setProductFilter(e.target.value)}
                className={styles.select}
                style={{ minWidth: 120 }}
              >
                <option value="">สินค้าทั้งหมด</option>
                {productNames.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ลำดับ</th>
                <th>รหัสคำสั่งซื้อ</th>
                <th>ลูกค้า</th>
                <th>สินค้า</th>
                <th>ประเภท</th>
                <th>ยอดรวม</th>
                <th>สถานะ</th>
                <th>วันที่เริ่ม</th>
                <th>วันที่สิ้นสุด</th>
                <th>วันที่สร้าง</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={11} className={styles.centerTextEmpty}>ไม่พบข้อมูลคำสั่งซื้อ</td></tr>
              ) : paginated.map((o, idx) => (
                <tr key={o.id}>
                  <td className={styles.centerText}>{startIdx + idx + 1}</td>
                  <td>{o.id}</td>
                  <td>{!o.user_name || o.user_name.trim() === '' ? 'null' : o.user_name}</td>
                  <td>{o.product_name}</td>
                  <td>{categoryLabel(o.category)}</td>
                  <td>{o.total_price.toLocaleString('th-TH')} บาท</td>
                  <td>{statusLabel(o.status)}</td>
                  <td>{formatDateThai(o.start_date)}</td>
                  <td>{formatDateThai(o.end_date)}</td>
                  <td>{formatDateThai(o.created_at)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button className={styles.detailButton} onClick={() => navigate(`/admin/orders/${o.id}`)}>ดูรายละเอียด</button>
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
        <ExportModal
          open={exportModalOpen}
          onClose={() => setExportModalOpen(false)}
          onExportFiltered={() => exportOrdersToCSV(filtered)}
          onExportAll={() => exportOrdersToCSV(orders)}
        />
      </div>
    </>
  );
} 