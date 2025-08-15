import { useState, useEffect } from 'react';
import styles from './OrderListPage.module.css';
import { useNavigate } from 'react-router-dom';
import MobileAccessModal from '../../../components/MobileAccessModal';
import { getContracts } from '../../../services/contract.service';
import type { Contract } from '../../../services/contract.service';
import OrderCreateModal from './OrderCreateModal';
import { formatDateShort, formatDateThai } from '../../../utils/date';
import LoadingSpinner from '../../../components/LoadingSpinner';

const statusMap: Record<string, { label: string; color: string }> = {
  active: { label: 'ผ่อนชำระอยู่', color: '#0ea5e9' },
  closed: { label: 'ปิดสัญญา', color: '#22c55e' },
  overdue: { label: 'ค้างชำระ', color: '#ef4444' },
  repossessed: { label: 'ยึดสินค้า', color: '#a21caf' },
  processing: { label: 'รอดำเนินการ', color: '#f59e42' },
  returned: { label: 'คืนสินค้า', color: '#6366f1' },
  hold_by_system: { label: 'ระบบถือครอง', color: '#8b5cf6' },
  default: { label: 'ค้างชำระ', color: '#ef4444' },
};

const statusLabel = (status: string) => {
  const s = statusMap[status] || statusMap.default;
  return (
    <span style={{
      display: 'inline-block',
      padding: '6px 16px',
      borderRadius: 16,
      fontWeight: 700,
      fontSize: '0.98rem',
      letterSpacing: '0.5px',
      background: s.color + '22',
      color: s.color,
    }}>{s.label}</span>
  );
};

const categoryLabel = (cat: string) => {
  if (cat === 'rent' || cat === 'installment') return 'ผ่อน';
  if (cat === 'cash_purchase' || cat === 'full') return 'ซื้อเงินสด';
  return cat;
};

const statusOptions = [
  { value: 'all', label: 'ทุกสถานะ' },
  { value: 'active', label: 'ผ่อนชำระอยู่' },
  { value: 'closed', label: 'ปิดสัญญา' },
  { value: 'processing', label: 'รอดำเนินการ' },
  { value: 'repossessed', label: 'ยึดสินค้า' },
  { value: 'returned', label: 'คืนสินค้า' },
  { value: 'default', label: 'ค้างชำระ' },
];
const categoryOptions = [
  { value: 'all', label: 'ทุกประเภท' },
  { value: 'rent', label: 'ผ่อน' },
  { value: 'cash_purchase', label: 'ซื้อเงินสด' },
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

// Modal แจ้งเตือนสำหรับสถานะจองโดยระบบ
function SystemHoldModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(30,41,59,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 12, backdropFilter: 'blur(3px)'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #fff 80%, #f8fafc 100%)',
        borderRadius: 24,
        padding: '40px 32px 32px 32px',
        maxWidth: 480,
        width: '100%',
        textAlign: 'center',
        position: 'relative',
        boxShadow: '0 12px 40px rgba(139, 92, 246, 0.15), 0 4px 12px rgba(139, 92, 246, 0.1)',
        border: '2px solid #e9d5ff'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16, background: 'none', border: 'none',
            fontSize: 28, color: '#8b5cf6', cursor: 'pointer', borderRadius: '50%', width: 40, height: 40,
            transition: 'background 0.15s', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
          aria-label="ปิด"
          onMouseOver={e => (e.currentTarget.style.background = '#f3f4f6')}
          onMouseOut={e => (e.currentTarget.style.background = 'none')}
        >×</button>
        
        <div style={{ 
          fontSize: 64, 
          marginBottom: 20, 
          filter: 'drop-shadow(0 4px 16px rgba(139, 92, 246, 0.3))',
          animation: 'pulse 2s ease-in-out infinite'
        }}>
          🔒
        </div>
        
        <div style={{ 
          fontWeight: 900, 
          fontSize: '1.5rem', 
          color: '#8b5cf6', 
          marginBottom: 16, 
          letterSpacing: 0.5 
        }}>
          เข้าถึงไม่ได้
        </div>
        
        <div style={{ 
          color: '#475569', 
          fontSize: '1.1rem', 
          marginBottom: 24, 
          lineHeight: 1.7, 
          fontWeight: 500 
        }}>
          คำสั่งซื้อนี้อยู่ในสถานะ <strong style={{ color: '#8b5cf6' }}>"ระบบถือครอง"</strong><br/>
          <span style={{ color: '#64748b', fontSize: '1rem' }}>
            เป็นส่วนสิทธิ์ของระบบ ไม่สามารถเข้าถึงรายละเอียดได้
          </span>
        </div>
        
        <div style={{
          background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
          borderRadius: 12,
          padding: '16px 20px',
          marginBottom: 28,
          border: '1px solid #d1d5db'
        }}>
          <div style={{ 
            color: '#374151', 
            fontSize: '0.95rem', 
            fontWeight: 600,
            marginBottom: 8 
          }}>
            สาเหตุที่เป็นไปได้:
          </div>
          <ul style={{ 
            color: '#6b7280', 
            fontSize: '0.9rem', 
            textAlign: 'left',
            margin: 0,
            paddingLeft: 20,
            lineHeight: 1.6
          }}>
            <li>สินค้าถูกจองโดยระบบอัตโนมัติ</li>
            <li>อยู่ระหว่างการประมวลผลข้อมูล</li>
            <li>มีการบำรุงรักษาระบบ</li>
          </ul>
        </div>
        
        <button
          style={{
            background: 'linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)', 
            color: '#fff', 
            border: 'none', 
            borderRadius: 16,
            padding: '16px 40px', 
            fontWeight: 800, 
            fontSize: '1.1rem', 
            cursor: 'pointer', 
            boxShadow: '0 4px 16px rgba(139, 92, 246, 0.3)',
            letterSpacing: 0.5, 
            transition: 'all 0.2s',
            minWidth: 160
          }}
          onClick={onClose}
          onMouseOver={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.4)';
          }}
          onMouseOut={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(139, 92, 246, 0.3)';
          }}
        >
          เข้าใจแล้ว
        </button>
      </div>
    </div>
  );
}

export default function OrderListPage() {
  const [orders, setOrders] = useState<Contract[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [showMobileWarn, setShowMobileWarn] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [showSystemHoldModal, setShowSystemHoldModal] = useState(false);
  const [searchParams, setSearchParams] = useState({
    search: '',
    status: 'all',
    category: 'all',
    product_name: '',
    start_date: '',
    end_date: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getContracts({
      page: currentPage,
      limit: rowsPerPage,
      search: searchParams.search || undefined,
      status: searchParams.status === 'all' ? undefined : searchParams.status,
      category: searchParams.category === 'all' ? undefined : searchParams.category,
      product_name: searchParams.product_name || undefined,
      start_date: searchParams.start_date || undefined,
      end_date: searchParams.end_date || undefined,
    })
      .then((data: { items: Contract[]; total: number; total_pages: number; }) => {
        setOrders(data.items ?? []);
        setTotal(data.total ?? 0);
        setTotalPages(data.total_pages ?? 1);
        setFetchError(null);
      })
      .catch(() => {
        setFetchError('เกิดข้อผิดพลาดในการโหลดข้อมูลคำสั่งซื้อ');
      })
      .finally(() => setLoading(false));
  }, [searchParams, currentPage, rowsPerPage]);

  const productNames = Array.from(new Set(orders.map(o => o.product_name)));
  const totalRows = total;
  const startIdx = (currentPage - 1) * rowsPerPage;
  const endIdx = startIdx + orders.length;
  const paginated = orders;

  // ปิด auto reset page เมื่อ filter เปลี่ยน

  // ตรวจสอบขนาดหน้าจอเมื่อ mount
  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth <= 640) {
        setShowMobileWarn(true);
      }
    };
    checkMobile();
  }, []);

  const handleMobileCancel = () => {
    if (window.innerWidth <= 640) {
      navigate(-1);
    } else {
      setShowMobileWarn(false);
    }
  };

  // ไม่ return ทั้งหน้า ให้ render โครงสร้างตลอด

  // ฟังก์ชันจัดการคลิกปุ่มดูรายละเอียด
  const handleViewDetail = (order: Contract) => {
    if (order.status === 'hold_by_system') {
      setShowSystemHoldModal(true);
    } else {
      navigate(`/admin/orders/${order.id}`);
    }
  };

  return (
    <>
      <MobileAccessModal
        open={showMobileWarn}
        mode="warn"
        onContinue={() => setShowMobileWarn(false)}
        onCancel={handleMobileCancel}
      />
      <OrderCreateModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} />
      <SystemHoldModal open={showSystemHoldModal} onClose={() => setShowSystemHoldModal(false)} />
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
                  category: categoryFilter,
                  product_name: productFilter,
                  start_date: startDate,
                  end_date: endDate
                });
                setCurrentPage(1);
              }}
            >ค้นหา</button>
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
              {loading ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: 'center', padding: 48 }}>
                    <LoadingSpinner text="กำลังโหลดข้อมูล..." />
                  </td>
                </tr>
              ) : fetchError ? (
                <tr>
                  <td colSpan={11} className={styles.errorText}>{fetchError}</td>
                </tr>
              ) : paginated.length === 0 ? (
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
                  <td>{formatDateShort(o.start_date)}</td>
                  <td>{formatDateShort(o.end_date)}</td>
                  <td>{formatDateThai(o.created_at)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button 
                      className={styles.detailButton} 
                      onClick={() => handleViewDetail(o)}
                      style={{
                        ...(o.status === 'hold_by_system' && {
                          background: '#f3f4f6',
                          color: '#6b7280',
                          cursor: 'not-allowed',
                          opacity: 0.7
                        })
                      }}
                    >
                      {o.status === 'hold_by_system' ? '🔒 เข้าถึงไม่ได้' : 'ดูรายละเอียด'}
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
        <ExportModal
          open={exportModalOpen}
          onClose={() => setExportModalOpen(false)}
          onExportFiltered={() => exportOrdersToCSV(paginated)}
          onExportAll={() => exportOrdersToCSV(orders)}
        />
      </div>
    </>
  );
} 