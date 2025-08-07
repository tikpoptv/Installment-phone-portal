import { useState, useEffect } from 'react';
import styles from './CustomerListPage.module.css';
import { MdVerified, MdHourglassEmpty, MdClose, MdRestore } from 'react-icons/md';
import { getCustomers } from '../../../services/customer/customer.service';
import type { Customer } from '../../../services/customer/customer.service';
import { useNavigate } from 'react-router-dom';
import { formatDateThai } from '../../../utils/date';
import MobileAccessModal from '../../../components/MobileAccessModal';
import LoadingSpinner from '../../../components/LoadingSpinner';
import DeletedUsersModal from '../../../components/DeletedUsersModal';

type FilterType = 'all' | 'verified' | 'unverified';

const statusLabel = (is_verified: boolean) =>
  is_verified ? (
    <span className={styles.statusVerified} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <MdVerified size={20} color="#22c55e" style={{ marginRight: 2 }} />
      ยืนยันแล้ว
    </span>
  ) : (
    <span className={styles.statusPending} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <MdHourglassEmpty size={20} color="#f59e42" style={{ marginRight: 2 }} />
      รอการยืนยัน
    </span>
  );

function exportCustomersToCSV(customers: Customer[]) {
  const header = ['ลำดับ', 'ชื่อ', 'นามสกุล', 'เบอร์โทร', 'อีเมล', 'สมัครเมื่อ', 'สถานะ'];
  const rows = customers.map((c, idx) => [
    idx + 1,
    c.first_name,
    c.last_name,
    c.phone_number,
    c.email,
    c.created_at,
    c.is_verified ? 'ยืนยันแล้ว' : 'รอการยืนยัน',
  ]);
  const csvContent = [header, ...rows]
    .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    .join('\r\n');
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'customer-list.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Modal Popup Component
function ExportModal({ open, onClose, onExportFiltered, onExportAll }: {
  open: boolean;
  onClose: () => void;
  onExportFiltered: () => void;
  onExportAll: () => void;
}) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.18)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ position: 'relative', background: '#fff', borderRadius: 12, padding: 32, minWidth: 320, boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
            borderRadius: '50%',
            transition: 'background 0.18s',
          }}
          onMouseOver={e => (e.currentTarget.style.background = '#f1f5f9')}
          onMouseOut={e => (e.currentTarget.style.background = 'none')}
          aria-label="ปิด"
        >
          <MdClose size={22} color="#64748b" />
        </button>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#0ea5e9' }}>Export ข้อมูลลูกค้า</div>
        <div style={{ marginBottom: 24, color: '#334155' }}>คุณต้องการ export ข้อมูลลูกค้าแบบไหน?</div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
          <button style={{
            background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 600, fontSize: 16, cursor: 'pointer',
          }} onClick={() => { onExportFiltered(); onClose(); }}>เฉพาะข้อมูลที่แสดงอยู่</button>
          <button style={{
            background: '#e0e7ef', color: '#0ea5e9', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 600, fontSize: 16, cursor: 'pointer',
          }} onClick={() => { onExportAll(); onClose(); }}>ข้อมูลทั้งหมด</button>
        </div>
      </div>
    </div>
  );
}

export default function CustomerListPage() {
  // const [search, setSearch] = useState(''); // สำหรับ trigger fetch จริง (ลบทิ้ง)
  const [searchInput, setSearchInput] = useState(''); // สำหรับ input ช่องค้นหา
  const [filter, setFilter] = useState<FilterType>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [mobileWarningOpen, setMobileWarningOpen] = useState(false);
  const [pendingDetailId, setPendingDetailId] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState<{search: string; filter: FilterType;}>({search: '', filter: 'all'});
  const [deletedUsersModalOpen, setDeletedUsersModalOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    getCustomers({
      page: currentPage,
      limit: rowsPerPage,
      search: searchParams.search || undefined,
      is_verified: searchParams.filter === 'all' ? undefined : searchParams.filter === 'verified' ? true : false
    })
      .then((data: { items: Customer[]; total: number; total_pages: number; }) => {
        setCustomers(data.items ?? []);
        setTotal(data.total ?? 0);
        setTotalPages(data.total_pages ?? 1);
      })
      .finally(() => setLoading(false));
  }, [searchParams, currentPage, rowsPerPage]);

  const totalRows = total;
  const startIdx = (currentPage - 1) * rowsPerPage;
  const endIdx = startIdx + customers.length;
  const paginated = customers;

  // React.useEffect(() => {
  //   setCurrentPage(1);
  // }, [rowsPerPage, search, filter]);
  // ปิด auto reset page เมื่อ search/filter เปลี่ยน

  const handleMobileCancel = () => {
    if (window.innerWidth <= 640) {
      navigate(-1);
    } else {
      setMobileWarningOpen(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>รายชื่อลูกค้า</h2>
        <div className={styles.actionGroup}>
          <button 
            onClick={() => setDeletedUsersModalOpen(true)}
            style={{
              background: '#fef3c7',
              color: '#d97706',
              border: '1.5px solid #f59e0b',
              borderRadius: '8px',
              padding: '8px 18px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background 0.18s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseOver={e => (e.currentTarget.style.background = '#fde68a')}
            onMouseOut={e => (e.currentTarget.style.background = '#fef3c7')}
          >
            <MdRestore size={18} />
            ผู้ใช้ที่ถูกลบ
          </button>
          <button className={styles.addButton} onClick={() => setShowQrModal(true)}>เพิ่มลูกค้าใหม่</button>
          <button className={styles.exportButton} onClick={() => setExportModalOpen(true)}>Export</button>
        </div>
      </div>
      <div className={styles.filterRow}>
        <input
          type="text"
          placeholder="ค้นหาชื่อ, เบอร์, อีเมล..."
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          className={styles.searchInput}
        />
        <button
          className={styles.searchButton}
          style={{ marginLeft: 8, minWidth: 80 }}
          onClick={() => {
            setSearchParams({search: searchInput, filter});
            setCurrentPage(1);
          }}
        >ค้นหา</button>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value as FilterType)}
          className={styles.select}
        >
          <option value="all">ทั้งหมด</option>
          <option value="verified">ยืนยันแล้ว</option>
          <option value="unverified">ยังไม่ยืนยัน</option>
        </select>
        <select
          value={rowsPerPage}
          onChange={e => setRowsPerPage(Number(e.target.value))}
          className={styles.select}
          style={{ marginLeft: 8 }}
        >
          <option value={25}>25 รายการ/หน้า</option>
          <option value={50}>50 รายการ/หน้า</option>
          <option value={75}>75 รายการ/หน้า</option>
          <option value={100}>100 รายการ/หน้า</option>
        </select>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>อันดับ</th>
              <th>ชื่อ-นามสกุล</th>
              <th>เบอร์โทร</th>
              <th>อีเมล</th>
              <th>สมัครเมื่อ</th>
              <th>สถานะ</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 48 }}>
                  <LoadingSpinner text="กำลังโหลดข้อมูล..." />
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: '#64748b', padding: 32 }}>ไม่พบข้อมูล</td></tr>
            ) : paginated.map((c, idx) => (
              <tr key={c.id}>
                <td style={{ textAlign: 'center' }}>{startIdx + idx + 1}</td>
                <td>{c.first_name} {c.last_name}</td>
                <td>{c.phone_number}</td>
                <td>{c.email}</td>
                <td style={{ textAlign: 'center' }}>{formatDateThai(c.created_at)}</td>
                <td style={{ textAlign: 'center' }}>{statusLabel(c.is_verified)}</td>
                <td style={{ textAlign: 'center' }}>
                  <button
                    className={styles.detailButton}
                    onClick={() => {
                      if (window.innerWidth < 768) {
                        setPendingDetailId(c.id);
                        setMobileWarningOpen(true);
                      } else {
                        navigate(`/admin/customers/${c.id}`);
                      }
                    }}
                  >ดูรายละเอียด</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.paginationBar}>
        <span>แสดง {startIdx + 1}-{Math.min(endIdx, totalRows)} จาก {totalRows} รายการ</span>
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
        onExportFiltered={() => exportCustomersToCSV(paginated)}
        onExportAll={() => {
          setLoading(true);
          getCustomers({
            page: 1,
            limit: rowsPerPage,
            search: searchParams.search || undefined,
            is_verified: searchParams.filter === 'all' ? undefined : searchParams.filter === 'verified' ? true : false
          })
            .then((data: { items: Customer[] }) => {
              exportCustomersToCSV(data.items ?? []);
            })
            .finally(() => setLoading(false));
        }}
      />
      {/* Mobile Warning Modal */}
      <MobileAccessModal
        open={mobileWarningOpen}
        mode="warn"
        onContinue={() => {
          setMobileWarningOpen(false);
          if (pendingDetailId) navigate(`/admin/customers/${pendingDetailId}`);
        }}
        onCancel={handleMobileCancel}
      />
      {showQrModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.18)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ position: 'relative', background: '#fff', borderRadius: 12, padding: 32, minWidth: 320, boxShadow: '0 4px 24px rgba(0,0,0,0.12)', textAlign: 'center' }}>
            <button
              onClick={() => setShowQrModal(false)}
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 4,
                borderRadius: '50%',
                transition: 'background 0.18s',
              }}
              onMouseOver={e => (e.currentTarget.style.background = '#f1f5f9')}
              onMouseOut={e => (e.currentTarget.style.background = 'none')}
              aria-label="ปิด"
            >
              <MdClose size={22} color="#64748b" />
            </button>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#0ea5e9' }}>เพิ่มลูกค้าใหม่</div>
            <div style={{ marginBottom: 18 }}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(`https://${import.meta.env.VITE_USER_DOMAIN}/`)}`}
                alt="QR Code สมัครลูกค้าใหม่"
                style={{ width: 220, height: 220, borderRadius: 12, border: '1.5px solid #e0e7ef', background: '#f8fafc' }}
              />
            </div>
            <a
              href={`https://${import.meta.env.VITE_USER_DOMAIN}/`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#0ea5e9', fontWeight: 600, fontSize: 16, textDecoration: 'underline' }}
            >
              ไปที่หน้าสมัครลูกค้าใหม่
            </a>
          </div>
        </div>
      )}
      {deletedUsersModalOpen && (
        <DeletedUsersModal
          open={deletedUsersModalOpen}
          onClose={() => setDeletedUsersModalOpen(false)}
        />
      )}
    </div>
  );
} 