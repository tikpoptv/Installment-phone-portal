import React, { useState, useEffect } from 'react';
import styles from './ManageAdmin.module.css';
import { getAdmins, registerAdmin, type RegisterAdminResponse, updateAdmin, lockAdmin, deleteAdmin } from '../../../services/admin.service';
import type { Admin } from '../../../services/admin.service';
import CreateAdminModal from './CreateAdminModal';
import CreateAdminSuccessModal from './CreateAdminSuccessModal';
import { toast } from 'react-toastify';
import { authService } from '../../../services/auth/auth.service';
import EditAdminModal from './EditAdminModal';
import LockAdminModal from './LockAdminModal';
import MobileAccessModal from '../../../components/MobileAccessModal';
import DeleteAdminModal from './DeleteAdminModal';
import LoadingSpinner from '../../../components/LoadingSpinner';

function formatDate(dt: string) {
  return new Date(dt).toLocaleString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function getStatus(admin: Admin): React.ReactNode {
  if (admin.is_creating) return <span style={{color:'#fbbf24', fontWeight:600}}>Creating</span>;
  if (admin.is_deleted) return <span style={{color:'#64748b'}}>Deleted</span>;
  if (admin.is_locked) return <span style={{color:'#ef4444'}}>Locked</span>;
  return <span style={{color:'#22c55e'}}>Normal</span>;
}

const ManageAdmin: React.FC = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [successModal, setSuccessModal] = useState<null | {
    createToken: string;
    username: string;
    role: string;
    createdAt: string;
  }>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [editModal, setEditModal] = useState<{
    open: boolean;
    adminId: string;
    username: string;
    role: 'superadmin' | 'staff';
  } | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | undefined>(undefined);
  const [lockModal, setLockModal] = useState<{
    open: boolean;
    adminId: string;
    username: string;
    isLocked: boolean;
  } | null>(null);
  const [lockSubmitting, setLockSubmitting] = useState(false);
  const [lockError, setLockError] = useState<string | undefined>(undefined);
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    adminId: string;
    username: string;
  } | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | undefined>(undefined);
  // ดึง user ปัจจุบันจาก authService
  const currentUser = authService.getUser() as { id?: string; role?: string } || {};
  const [showMobileModal, setShowMobileModal] = useState(false);

  useEffect(() => {
    // เช็คว่าเป็น mobile หรือ tablet
    const isMobile = window.innerWidth < 900 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) setShowMobileModal(true);
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getAdmins()
      .then(setAdmins)
      .catch(() => setError('เกิดข้อผิดพลาดในการโหลดข้อมูลแอดมิน'))
      .finally(() => setLoading(false));
  }, []);

  const handleCreateAdmin = async (data: { username: string; role: 'superadmin' | 'staff' }) => {
    setIsSubmitting(true);
    setIsError(false);
    setErrorMessage(undefined);
    try {
      const res: RegisterAdminResponse = await registerAdmin(data);
      setSuccessModal({
        createToken: res.create_token,
        username: res.username,
        role: res.role,
        createdAt: res.created_at,
      });
      // refresh รายการแอดมิน
      const admins = await getAdmins();
      setAdmins(admins);
      toast.success('สร้างแอดมินสำเร็จ!');
      setShowCreateModal(false);
    } catch (err: unknown) {
      toast.error(typeof err === 'string' ? err : JSON.stringify(err));
      setIsError(true);
      setErrorMessage(typeof err === 'string' ? err : JSON.stringify(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showMobileModal) {
    return <MobileAccessModal open mode="block" onCancel={() => {}} />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>จัดการแอดมิน</h1>
        <button className={styles.addButton} onClick={() => {
          if (currentUser?.role !== 'superadmin') {
            window.dispatchEvent(new CustomEvent('no-permission', {
              detail: {
                title: 'ไม่มีสิทธิ์เข้าถึง',
                message: 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้ เฉพาะผู้ใช้ที่มีสิทธิ์ Super Admin เท่านั้น'
              }
            }));
            return;
          }
          setShowCreateModal(true);
        }}>+ เพิ่มแอดมิน</button>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ชื่อผู้ใช้</th>
              <th>สิทธิ์</th>
              <th>Status</th>
              <th>Create Token</th>
              <th>วันที่สร้าง</th>
              <th>อัปเดตล่าสุด</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 48 }}>
                  <LoadingSpinner text="กำลังโหลดข้อมูล..." />
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: '#ef4444', padding: 32 }}>{error}</td>
              </tr>
            ) : admins.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: '#64748b', padding: 32 }}>ไม่พบข้อมูลแอดมิน</td>
              </tr>
            ) : admins.map(admin => (
              <tr key={admin.id} style={admin.is_deleted ? {opacity:0.5, textDecoration:'line-through'} : {}}>
                <td>{admin.username}</td>
                <td>
                  <span className={admin.role === 'superadmin' ? styles.roleSuper : styles.roleStaff}>
                    {admin.role === 'superadmin' ? 'Super Admin' : 'Staff'}
                  </span>
                </td>
                <td>{getStatus(admin)}</td>
                <td>
                  {admin.create_token ? (
                    <button
                      className={styles.copyTokenBtn}
                      disabled={admin.is_deleted}
                      onClick={() => setSuccessModal({
                        createToken: admin.create_token,
                        username: admin.username,
                        role: admin.role,
                        createdAt: admin.created_at
                      })}
                    >ดู Token</button>
                  ) : '-'}
                </td>
                <td>{formatDate(admin.created_at)}</td>
                <td>{formatDate(admin.updated_at)}</td>
                <td>
                  {currentUser.role === 'superadmin' && admin.id !== currentUser.id && admin.username !== 'administrator' && (
                    <>
                      <button
                        className={styles.editBtn}
                        disabled={admin.is_deleted}
                        onClick={() => setEditModal({
                          open: true,
                          adminId: admin.id,
                          username: admin.username,
                          role: admin.role
                        })}
                      >แก้ไข</button>
                      <button
                        className={admin.is_locked ? styles.unlockBtn : styles.lockBtn}
                        disabled={admin.is_deleted}
                        onClick={() => setLockModal({
                          open: true,
                          adminId: admin.id,
                          username: admin.username,
                          isLocked: admin.is_locked
                        })}
                      >{admin.is_locked ? 'ปลดล็อก' : 'ล็อก'}</button>
                      <button
                        className={styles.deleteBtn}
                        disabled={admin.is_deleted || admin.is_locked}
                        onClick={() => setDeleteModal({
                          open: true,
                          adminId: admin.id,
                          username: admin.username
                        })}
                      >ลบ</button>
                    </>
                  )}
                  {admin.username === 'administrator' && (
                    <span style={{color: '#64748b', fontStyle: 'italic'}}>Protected</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CreateAdminModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateAdmin}
        isSubmitting={isSubmitting}
        isError={isError}
        errorMessage={errorMessage}
      />
      <CreateAdminSuccessModal
        open={!!successModal}
        onClose={() => setSuccessModal(null)}
        createToken={successModal?.createToken || ''}
        username={successModal?.username || ''}
        role={successModal?.role || ''}
        createdAt={successModal?.createdAt || ''}
      />
      <EditAdminModal
        open={!!editModal}
        onClose={() => setEditModal(null)}
        adminId={editModal?.adminId || ''}
        initialUsername={editModal?.username || ''}
        initialRole={editModal?.role || 'staff'}
        isSubmitting={editSubmitting}
        errorMessage={editError}
        onSubmit={async (id, data) => {
          setEditSubmitting(true);
          setEditError(undefined);
          try {
            await updateAdmin(id, data);
            setEditModal(null);
            // refresh รายการแอดมิน
            const admins = await getAdmins();
            setAdmins(admins);
            // toast.success('แก้ไขข้อมูลแอดมินสำเร็จ!'); // ย้ายไป onSuccess
          } catch (err: unknown) {
            let msg = 'เกิดข้อผิดพลาด';
            if (err && typeof err === 'object' && 'message' in err && typeof (err as { message?: unknown }).message === 'string') {
              msg = (err as { message: string }).message;
            }
            setEditError(msg);
          } finally {
            setEditSubmitting(false);
          }
        }}
        onSuccess={() => toast.success('แก้ไขข้อมูลแอดมินสำเร็จ!')}
      />
      <LockAdminModal
        open={!!lockModal}
        onClose={() => setLockModal(null)}
        isLocked={lockModal?.isLocked || false}
        username={lockModal?.username || ''}
        isSubmitting={lockSubmitting}
        errorMessage={lockError}
        onSubmit={async (isLocked) => {
          if (!lockModal) return;
          setLockSubmitting(true);
          setLockError(undefined);
          try {
            await lockAdmin(lockModal.adminId, isLocked);
            setLockModal(null);
            const admins = await getAdmins();
            setAdmins(admins);
            toast.success(isLocked ? 'ล็อกแอดมินสำเร็จ!' : 'ปลดล็อกแอดมินสำเร็จ!');
          } catch (err: unknown) {
            let msg = 'เกิดข้อผิดพลาด';
            if (err && typeof err === 'object' && 'message' in err && typeof (err as { message?: unknown }).message === 'string') {
              msg = (err as { message: string }).message;
            }
            setLockError(msg);
          } finally {
            setLockSubmitting(false);
          }
        }}
      />
      <DeleteAdminModal
        open={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        username={deleteModal?.username || ''}
        isSubmitting={deleteSubmitting}
        errorMessage={deleteError}
        onConfirm={async () => {
          if (!deleteModal) return;
          setDeleteSubmitting(true);
          setDeleteError(undefined);
          try {
            await deleteAdmin(deleteModal.adminId);
            setDeleteModal(null);
            const admins = await getAdmins();
            setAdmins(admins);
            toast.success('ลบแอดมินสำเร็จ!');
          } catch (err: unknown) {
            let msg = 'เกิดข้อผิดพลาด';
            if (err && typeof err === 'object' && 'message' in err && typeof (err as { message?: unknown }).message === 'string') {
              msg = (err as { message: string }).message;
            }
            setDeleteError(msg);
          } finally {
            setDeleteSubmitting(false);
          }
        }}
      />
    </div>
  );
};

export default ManageAdmin; 