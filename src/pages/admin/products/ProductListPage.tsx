import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ProductListPage.module.css';
import { formatDateThai } from '../../../utils/date';
import MobileAccessModal from '../../../components/MobileAccessModal';
import ProductCreateModal from './ProductCreateModal';
import { getProducts } from '../../../services/products.service';
import type { Product } from '../../../services/products.service';
import LoadingSpinner from '../../../components/LoadingSpinner';

const statusLabel = (status: string) => {
  if (!status) return <span style={{ color: '#64748b', fontWeight: 600 }}>ไม่ระบุ</span>;
  if (status === 'available') return <span style={{ color: '#22c55e', fontWeight: 600 }}>ว่าง</span>;
  if (status === 'leased') return <span style={{ color: '#f59e42', fontWeight: 600 }}>ติดสัญญา</span>;
  if (status === 'sold') return <span style={{ color: '#ef4444', fontWeight: 600 }}>ขายแล้ว</span>;
  return <span style={{ color: '#64748b', fontWeight: 600 }}>{status}</span>;
};

function exportProductsToCSV(products: Product[]) {
  const header = ['ลำดับ', 'รหัสสินค้า', 'ชื่อรุ่น', 'Serial Number', 'ราคา', 'LOGO', 'สถานะ MDM', 'หมายเหตุ', 'สถานะ', 'วันที่เพิ่ม'];
  const rows = products.map((p, idx) => [
    idx + 1,
    p.id || '',
    p.model_name || '',
    p.imei || '',
    p.price || 0,
    p.icloud_status === 'unlocked' ? 'unlocked' : p.icloud_status || '',
    p.store_locked ? 'locked' : 'unlocked',
    p.remark || '',
    p.status === 'available' ? 'ว่าง' : p.status === 'sold' ? 'ขายแล้ว' : p.status || 'ไม่ระบุ',
    p.created_at ? formatDateThai(p.created_at) : '',
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
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [productIdInput, setProductIdInput] = useState('');
  const [filter, setFilter] = useState<'all' | 'available' | 'leased' | 'sold'>('all');
  const [icloudFilter, setIcloudFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [storeLockedFilter, setStoreLockedFilter] = useState<'all' | 'locked' | 'unlocked'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showMobileWarning, setShowMobileWarning] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useState<{
    search: string;
    product_id: string;
    status: string;
    icloud_status: string;
    store_locked?: boolean;
    min_price?: number;
    max_price?: number;
  }>({
    search: '',
    product_id: '',
    status: 'all',
    icloud_status: 'all',
    store_locked: undefined,
    min_price: undefined,
    max_price: undefined
  });
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getProducts({
      page: currentPage,
      limit: rowsPerPage,
      search: searchParams.search || undefined,
      product_id: searchParams.product_id || undefined,
      status: searchParams.status === 'all' ? undefined : searchParams.status,
      icloud_status: searchParams.icloud_status === 'all' ? undefined : searchParams.icloud_status,
      store_locked: searchParams.store_locked,
      min_price: searchParams.min_price,
      max_price: searchParams.max_price
    })
      .then((data: { items: Product[]; total: number; total_pages: number; }) => {
        setProducts(data.items ?? []);
        setTotal(data.total ?? 0);
        setTotalPages(data.total_pages ?? 1);
        setFetchError(null);
      })
      .catch(() => {
        setFetchError('เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า');
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [searchParams, currentPage, rowsPerPage]);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setShowMobileWarning(true);
    }
  }, []);

  const totalRows = total;
  const startIdx = (currentPage - 1) * rowsPerPage;
  const endIdx = startIdx + products.length;
  const paginated = products;

  // ปิด auto reset page เมื่อ filter/search/rowsPerPage เปลี่ยน

  // ฟังก์ชันแปลงเลขเป็น comma
  const formatNumber = (val: string) => {
    if (!val) return '';
    const num = Number(val.replace(/,/g, ''));
    if (isNaN(num)) return val;
    return num.toLocaleString('th-TH');
  };

  const handleMobileCancel = () => {
    if (window.innerWidth <= 640) {
      navigate(-1);
    } else {
      setShowMobileWarning(false);
    }
  };

  return (
    <>
      <MobileAccessModal
        open={showMobileWarning}
        mode="warn"
        onContinue={() => setShowMobileWarning(false)}
        onCancel={handleMobileCancel}
      />
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
              placeholder="รหัสสินค้า"
              value={productIdInput}
              onChange={e => setProductIdInput(e.target.value)}
              className={`${styles.searchInput} ${styles.productIdInput}`}
            />
            <input
              type="text"
              placeholder="ค้นหาชื่อรุ่น, Serial Number, หมายเหตุ..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className={`${styles.searchInput} ${styles.searchInputMain}`}
            />
            <button
              className={styles.searchButton}
              onClick={() => {
                setSearchParams({
                  search: searchInput,
                  product_id: productIdInput,
                  status: filter,
                  icloud_status: icloudFilter,
                  store_locked: storeLockedFilter === 'all' ? undefined : storeLockedFilter === 'locked',
                  min_price: minPrice ? Number(minPrice) : undefined,
                  max_price: maxPrice ? Number(maxPrice) : undefined
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
                <option value="all">LOGO ทั้งหมด</option>
                <option value="unlocked">unlocked</option>
                <option value="locked">locked</option>
              </select>
              <select
                value={storeLockedFilter}
                onChange={e => setStoreLockedFilter(e.target.value as 'all' | 'locked' | 'unlocked')}
                className={styles.select}
                style={{ marginLeft: 8 }}
              >
                <option value="all">MDM ทั้งหมด</option>
                <option value="unlocked">unlocked</option>
                <option value="locked">locked</option>
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
                <th>Serial Number</th>
                <th>ราคา</th>
                <th>LOGO</th>
                <th>สถานะ MDM</th>
                <th>สถานะ</th>
                <th>วันที่เพิ่ม</th>
                <th>หมายเหตุ</th>
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
                  <td colSpan={11} style={{ textAlign: 'center', color: '#ef4444', padding: 32 }}>{fetchError}</td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={11} style={{ textAlign: 'center', color: '#64748b', padding: 32 }}>ไม่พบข้อมูลสินค้า</td></tr>
              ) : paginated.map((p, idx) => (
                <tr key={p.id}>
                  <td style={{ textAlign: 'center' }}>{startIdx + idx + 1}</td>
                  <td>{p.id || '-'}</td>
                  <td>{p.model_name || '-'}</td>
                  <td>{p.imei || '-'}</td>
                  <td>{p.price?.toLocaleString('th-TH') || '0'} บาท</td>
                  <td style={{ 
                    color: p.icloud_status === 'unlocked' ? '#22c55e' : '#f59e42', 
                    fontWeight: 600 
                  }}>
                    {p.icloud_status === 'unlocked' ? 'unlocked' : p.icloud_status || '-'}
                  </td>
                  <td style={{ 
                    color: p.store_locked ? '#f59e42' : '#22c55e', 
                    fontWeight: 600 
                  }}>
                    {p.store_locked ? 'locked' : 'unlocked'}
                  </td>
                  <td>{statusLabel(p.status || 'unknown')}</td>
                  <td>{p.created_at ? formatDateThai(p.created_at) : '-'}</td>
                  <td>{p.remark || '-'}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button className={styles.detailButton} onClick={() => navigate(`/admin/products/${p.id}`)}>ดูรายละเอียด</button>
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
          onExportFiltered={() => exportProductsToCSV(paginated)}
          onExportAll={() => exportProductsToCSV(products)}
        />
      </div>
    </>
  );
} 