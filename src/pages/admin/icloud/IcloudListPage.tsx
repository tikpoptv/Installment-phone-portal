import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileAccessModal from '../../../components/MobileAccessModal';
import styles from './IcloudListPage.module.css';
import { getIcloudCredentials, deleteIcloudCredential } from '../../../services/icloud.service';
import type { IcloudCredential } from '../../../services/icloud.service';
import IcloudCreateModal from './IcloudCreateModal';
import { toast } from 'react-toastify';
import { FaFileAlt, FaTrash, FaPlus } from 'react-icons/fa';
import IcloudDetailModal from './IcloudDetailModal';
import IcloudDeleteConfirmModal from './IcloudDeleteConfirmModal';

const ownerTypeOptions = [
  { value: '', label: 'ทุกประเภทเจ้าของ' },
  { value: 'customer', label: 'ลูกค้า' },
  { value: 'store', label: 'ร้านค้า' },
];

const rowsPerPageOptions = [25, 50, 75, 100];

const IcloudListPage: React.FC = () => {
  // const [search, setSearch] = useState(''); // สำหรับ trigger fetch จริง (ลบทิ้ง)
  const [searchInput, setSearchInput] = useState(''); // สำหรับ input ช่องค้นหา
  const [ownerType, setOwnerType] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileWarn, setShowMobileWarn] = useState(false);
  const [iclouds, setIclouds] = useState<IcloudCredential[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedIcloudId, setSelectedIcloudId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetUsername, setDeleteTargetUsername] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState<{search: string; ownerType: string;}>({search: '', ownerType: ''});
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getIcloudCredentials({
      page: currentPage,
      limit: rowsPerPage,
      search: searchParams.search || undefined,
      owner_type: searchParams.ownerType || undefined
    })
      .then((data: { items: IcloudCredential[]; total: number; page: number; limit: number; total_pages: number; }) => {
        setIclouds(data.items ?? []);
        setTotal(data.total ?? 0);
        setTotalPages(data.total_pages ?? 1);
        setError(null);
      })
      .catch(() => {
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูล iCloud');
        setIclouds([]);
      })
      .finally(() => setLoading(false));
  }, [searchParams, currentPage, rowsPerPage]);

  const totalRows = total;
  const startIdx = (currentPage - 1) * rowsPerPage;
  const endIdx = startIdx + iclouds.length;
  const paginated = iclouds;

  // ตรวจสอบขนาดหน้าจอเมื่อ mount
  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth <= 640) {
        setShowMobileWarn(true);
      }
    };
    checkMobile();
  }, []);

  // กดยกเลิกแล้วกลับหน้าก่อนหน้า
  const handleMobileCancel = () => {
    if (window.innerWidth <= 640) {
      navigate(-1);
    } else {
      setShowMobileWarn(false);
    }
  };

  if (loading) {
    return <div className={styles.loadingMessage}>กำลังโหลดข้อมูล...</div>;
  }
  if (error) {
    return <div className={styles.loadingMessage} style={{color:'#ef4444'}}>{error}</div>;
  }

  return (
    <>
      <MobileAccessModal
        open={showMobileWarn}
        mode="warn"
        onContinue={() => setShowMobileWarn(false)}
        onCancel={handleMobileCancel}
      />
      <IcloudDetailModal
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        icloudId={selectedIcloudId}
      />
      <IcloudCreateModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {}}
      />
      <IcloudDeleteConfirmModal
        open={!!deleteTargetId}
        icloudId={deleteTargetId}
        icloudUsername={deleteTargetUsername}
        onClose={() => {
          setDeleteTargetId(null);
          setDeleteTargetUsername(null);
        }}
        onDeleteConfirm={async () => {
          setDeleteTargetId(null);
          setDeleteTargetUsername(null);
          setLoading(true);
          try {
            await deleteIcloudCredential(deleteTargetId!);
            toast.success('ลบ iCloud สำเร็จ!');
            getIcloudCredentials()
              .then(data => {
                setIclouds(data.items ?? []);
                setError(null);
              })
              .catch(() => {
                setError('เกิดข้อผิดพลาดในการโหลดข้อมูล iCloud');
                setIclouds([]);
              })
              .finally(() => setLoading(false));
          } catch (err: unknown) {
            let msg = 'เกิดข้อผิดพลาดขณะลบ iCloud';
            let errMsg = '';
            if (typeof err === 'object' && err !== null) {
              if ('message' in err && typeof (err as Record<string, unknown>).message === 'string') {
                errMsg = (err as Record<string, unknown>).message as string;
              } else if ('error' in err && typeof (err as Record<string, unknown>).error === 'string') {
                errMsg = (err as Record<string, unknown>).error as string;
              }
            }
            if (/duplicate|ซ้ำ|SQLSTATE 23505|icloud_username_unique/i.test(errMsg)) {
              msg = 'ไม่สามารถลบได้ เนื่องจากข้อมูลนี้มีปัญหาเรื่องความซ้ำหรือข้อจำกัดของระบบ';
            }
            toast.error(msg);
            setLoading(false);
          }
        }}
      />
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>รายการ iCloud</h2>
          <div className={styles.actionGroup}>
            <button className={styles.addButtonDisabled} disabled title="สร้าง iCloud ใหม่ (ปิดใช้งาน)">
              <FaPlus style={{ marginRight: 6, marginBottom: -2 }} /> สร้าง iCloud
            </button>
          </div>
        </div>
        <div className={styles.filterRow}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="ค้นหา ID, ชื่อผู้ใช้..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
          />
          <button
            className={styles.searchButton}
            style={{ marginLeft: 8, minWidth: 80 }}
            onClick={() => {
              setSearchParams({search: searchInput, ownerType});
              setCurrentPage(1);
            }}
          >ค้นหา</button>
          <select
            className={styles.select}
            value={ownerType}
            onChange={e => setOwnerType(e.target.value)}
          >
            {ownerTypeOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            className={styles.select}
            value={rowsPerPage}
            onChange={e => setRowsPerPage(Number(e.target.value))}
            style={{ minWidth: 160, marginLeft: 12 }}
          >
            {rowsPerPageOptions.map(opt => (
              <option key={opt} value={opt}>{opt} รายการ/หน้า</option>
            ))}
          </select>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.icloudTable}>
            <thead>
              <tr>
                <th>ลำดับ</th>
                <th>ID</th>
                <th>ประเภทเจ้าของ</th>
                <th>ชื่อผู้ใช้ iCloud</th>
                <th>วันที่สร้าง</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={6} className={styles.centerTextEmpty}>ไม่พบข้อมูล iCloud</td></tr>
              ) : paginated.map((item, idx) => (
                <tr key={item.id}>
                  <td style={{ textAlign: 'center' }}>{startIdx + idx + 1}</td>
                  <td>{item.id}</td>
                  <td>{item.owner_type === 'customer' ? 'ลูกค้า' : 'ร้านค้า'}</td>
                  <td>{item.icloud_username}</td>
                  <td>{new Date(item.created_at).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                  <td className={styles.actionCell}>
                    <div className={styles.actionButtons}>
                      <button
                        type="button"
                        title="ดูรายละเอียด"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onClick={() => {
                          setSelectedIcloudId(item.id);
                          setShowDetailModal(true);
                        }}
                      >
                        <FaFileAlt size={18} color="#0ea5e9" />
                      </button>
                      <button
                        type="button"
                        title="ลบ"
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                        onClick={() => {
                          setDeleteTargetId(item.id);
                          setDeleteTargetUsername(item.icloud_username);
                        }}
                      >
                        <FaTrash size={17} color="#ef4444" />
                      </button>
                    </div>
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
    </>
  );
};

export default IcloudListPage; 