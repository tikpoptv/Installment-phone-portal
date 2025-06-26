import { useState, useEffect } from 'react';
import styles from './ProductListPage.module.css';
import { formatDateThai } from '../../../utils/date';
import MobileAccessModal from '../../../components/MobileAccessModal';
import ProductCreateModal from './ProductCreateModal';

interface Product {
  id: string;
  model_name: string;
  status: string;
  imei: string;
  price: number;
  icloud_status: string;
  remark: string;
  created_at: string;
}

const mockProducts: Product[] = [
  {
    id: 'PD00001',
    model_name: 'iPhone 13 Pro Max',
    status: 'available',
    imei: '123456789012345',
    price: 29900.0,
    icloud_status: 'unlocked',
    remark: 'สภาพดีมาก',
    created_at: '2024-07-01T12:00:00Z',
  },
  {
    id: 'PD00002',
    model_name: 'iPhone 12',
    status: 'sold',
    imei: '987654321098765',
    price: 15900.0,
    icloud_status: 'locked',
    remark: 'มีรอยขีดข่วน',
    created_at: '2024-07-02T10:30:00Z',
  },
];

const statusLabel = (status: string) => {
  if (status === 'available') return <span style={{ color: '#22c55e', fontWeight: 600 }}>ว่าง</span>;
  if (status === 'leased') return <span style={{ color: '#f59e42', fontWeight: 600 }}>ติดสัญญา</span>;
  if (status === 'sold') return <span style={{ color: '#ef4444', fontWeight: 600 }}>ขายแล้ว</span>;
  return <span style={{ color: '#64748b', fontWeight: 600 }}>{status}</span>;
};

function exportProductsToCSV(products: Product[]) {
  const header = ['ลำดับ', 'รหัสสินค้า', 'ชื่อรุ่น', 'IMEI', 'ราคา', 'iCloud', 'หมายเหตุ', 'สถานะ', 'วันที่เพิ่ม'];
  const rows = products.map((p, idx) => [
    idx + 1,
    p.id,
    p.model_name,
    p.imei,
    p.price,
    p.icloud_status === 'unlocked' ? 'ปลดล็อก' : p.icloud_status,
    p.remark,
    p.status === 'available' ? 'ว่าง' : p.status === 'sold' ? 'ขายแล้ว' : p.status,
    formatDateThai(p.created_at),
  ]);
  const csvContent = [header, ...rows]
    .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    .join('\r\n');
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'product-list.csv');
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
        <div className={styles.exportModalTitle}>Export ข้อมูลสินค้า</div>
        <div className={styles.exportModalMessage}>คุณต้องการ export ข้อมูลสินค้าแบบไหน?</div>
        <div className={styles.exportModalButtons}>
          <button className={styles.exportButton} onClick={() => { onExportFiltered(); onClose(); }}>เฉพาะข้อมูลที่แสดงอยู่</button>
          <button className={styles.exportButton} onClick={() => { onExportAll(); onClose(); }}>ข้อมูลทั้งหมด</button>
        </div>
      </div>
    </div>
  );
}

export default function ProductListPage() {
  const [products] = useState<Product[]>(mockProducts);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'available' | 'leased' | 'sold'>('all');
  const [icloudFilter, setIcloudFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showMobileWarning, setShowMobileWarning] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    // จำลองโหลดข้อมูล
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setShowMobileWarning(true);
    }
  }, []);

  const filtered = products.filter((p) => {
    const match =
      p.model_name.includes(search) ||
      p.imei.includes(search) ||
      p.remark.includes(search) ||
      p.id.includes(search);
    let priceOk = true;
    if (minPrice && !isNaN(Number(minPrice))) priceOk = priceOk && p.price >= Number(minPrice);
    if (maxPrice && !isNaN(Number(maxPrice))) priceOk = priceOk && p.price <= Number(maxPrice);
    let icloudOk = true;
    if (icloudFilter === 'unlocked') icloudOk = p.icloud_status === 'unlocked';
    if (icloudFilter === 'locked') icloudOk = p.icloud_status === 'locked';
    if (filter === 'all') return match && priceOk && icloudOk;
    if (filter === 'available') return p.status === 'available' && match && priceOk && icloudOk;
    if (filter === 'leased') return p.status === 'leased' && match && priceOk && icloudOk;
    if (filter === 'sold') return p.status === 'sold' && match && priceOk && icloudOk;
    return match && priceOk && icloudOk;
  });

  const totalRows = filtered.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;
  const startIdx = (currentPage - 1) * rowsPerPage;
  const endIdx = startIdx + rowsPerPage;
  const paginated = filtered.slice(startIdx, endIdx);

  // reset page เมื่อเปลี่ยน filter/search/rowsPerPage
  useEffect(() => { setCurrentPage(1); }, [search, filter, rowsPerPage]);

  // ฟังก์ชันแปลงเลขเป็น comma
  const formatNumber = (val: string) => {
    if (!val) return '';
    const num = Number(val.replace(/,/g, ''));
    if (isNaN(num)) return val;
    return num.toLocaleString('th-TH');
  };

  if (loading) {
    return <div className={styles.loadingMessage}>กำลังโหลดข้อมูล...</div>;
  }

  return (
    <>
      <MobileAccessModal open={showMobileWarning} mode="warn" onContinue={() => setShowMobileWarning(false)} onCancel={() => setShowMobileWarning(false)} />
      <ProductCreateModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} />
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>รายการสินค้า</h2>
          <div className={styles.actionGroup}>
            <button className={styles.addButton} onClick={() => setCreateModalOpen(true)}>เพิ่มสินค้าใหม่</button>
            <button className={styles.exportButton} onClick={() => setExportModalOpen(true)}>Export</button>
          </div>
        </div>
        <div className={styles.filterRow}>
          <div className={styles.filterTopRow}>
            <input
              type="text"
              placeholder="ค้นหาชื่อรุ่น, IMEI, หมายเหตุ, รหัสสินค้า..."
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
                type="text"
                inputMode="numeric"
                pattern="[0-9,]*"
                placeholder="ราคาต่ำสุด"
                value={formatNumber(minPrice)}
                onChange={e => {
                  const raw = e.target.value.replace(/,/g, '');
                  if (/^\d*$/.test(raw)) setMinPrice(raw);
                }}
                className={styles.searchInput}
                style={{ maxWidth: 120 }}
              />
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9,]*"
                placeholder="ราคาสูงสุด"
                value={formatNumber(maxPrice)}
                onChange={e => {
                  const raw = e.target.value.replace(/,/g, '');
                  if (/^\d*$/.test(raw)) setMaxPrice(raw);
                }}
                className={styles.searchInput}
                style={{ maxWidth: 120, marginLeft: 8 }}
              />
            </div>
            <div className={styles.filterLeftGroup}>
              <select
                value={filter}
                onChange={e => setFilter(e.target.value as 'all' | 'available' | 'leased' | 'sold')}
                className={styles.select}
              >
                <option value="all">ทั้งหมด</option>
                <option value="available">ว่าง</option>
                <option value="leased">ติดสัญญา</option>
                <option value="sold">ขายแล้ว</option>
              </select>
              <select
                value={icloudFilter}
                onChange={e => setIcloudFilter(e.target.value as 'all' | 'unlocked' | 'locked')}
                className={styles.select}
                style={{ marginLeft: 8 }}
              >
                <option value="all">iCloud ทั้งหมด</option>
                <option value="unlocked">ปลดล็อก</option>
                <option value="locked">ล็อก</option>
              </select>
            </div>
          </div>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ลำดับ</th>
                <th>รหัสสินค้า</th>
                <th>ชื่อรุ่น</th>
                <th>IMEI</th>
                <th>ราคา</th>
                <th>iCloud</th>
                <th>หมายเหตุ</th>
                <th>สถานะ</th>
                <th>วันที่เพิ่ม</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={10} style={{ textAlign: 'center', color: '#64748b', padding: 32 }}>ไม่พบข้อมูลสินค้า</td></tr>
              ) : paginated.map((p, idx) => (
                <tr key={p.id}>
                  <td style={{ textAlign: 'center' }}>{startIdx + idx + 1}</td>
                  <td>{p.id}</td>
                  <td>{p.model_name}</td>
                  <td>{p.imei}</td>
                  <td>{p.price.toLocaleString('th-TH')} บาท</td>
                  <td>{p.icloud_status === 'unlocked' ? 'ปลดล็อก' : p.icloud_status}</td>
                  <td>{p.remark}</td>
                  <td>{statusLabel(p.status)}</td>
                  <td>{formatDateThai(p.created_at)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button className={styles.detailButton} onClick={() => alert('ฟีเจอร์ดูรายละเอียดสินค้าอยู่ระหว่างพัฒนา')}>ดูรายละเอียด</button>
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
        {/* Export Modal */}
        <ExportModal
          open={exportModalOpen}
          onClose={() => setExportModalOpen(false)}
          onExportFiltered={() => exportProductsToCSV(filtered)}
          onExportAll={() => exportProductsToCSV(products)}
        />
      </div>
    </>
  );
} 