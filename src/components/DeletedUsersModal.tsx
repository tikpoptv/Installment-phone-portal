import { useState, useEffect } from 'react';
import { MdClose, MdRestore, MdDelete } from 'react-icons/md';
import { getDeletedUsers, restoreUser } from '../services/user-management.service';
import type { DeletedUser } from '../services/user-management.service';
import { formatDateThai } from '../utils/date';
import { toast } from 'react-toastify';
import LoadingSpinner from './LoadingSpinner';

interface DeletedUsersModalProps {
  open: boolean;
  onClose: () => void;
}

export default function DeletedUsersModal({ open, onClose }: DeletedUsersModalProps) {
  const [deletedUsers, setDeletedUsers] = useState<DeletedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [restoreTargetUser, setRestoreTargetUser] = useState<DeletedUser | null>(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);

  useEffect(() => {
    if (open) {
      loadDeletedUsers();
    }
  }, [open]);

  const loadDeletedUsers = async () => {
    setLoading(true);
    try {
      const data = await getDeletedUsers();
      setDeletedUsers(data.users);
    } catch (error) {
      console.error('Error loading deleted users:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้ที่ถูกลบ');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreUser = (user: DeletedUser) => {
    setRestoreTargetUser(user);
    setShowRestoreConfirm(true);
  };

  const confirmRestoreUser = async () => {
    if (!restoreTargetUser) return;
    
    setRestoring(true);
    try {
      await restoreUser(restoreTargetUser.id);
      toast.success('กู้คืนผู้ใช้สำเร็จ');
      
      // รีเฟรชข้อมูล
      await loadDeletedUsers();
      
      setShowRestoreConfirm(false);
      setRestoreTargetUser(null);
    } catch (error: unknown) {
      console.error('Error restoring user:', error);
      const errorMessage = error && typeof error === 'object' && 'error' in error 
        ? String(error.error) 
        : 'เกิดข้อผิดพลาดในการกู้คืนผู้ใช้';
      toast.error(errorMessage);
    } finally {
      setRestoring(false);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Main Modal */}
      <div style={{
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100vw', 
        height: '100vh',
        background: 'rgba(0,0,0,0.18)', 
        zIndex: 9999, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center'
      }}>
        <div style={{ 
          position: 'relative', 
          background: '#fff', 
          borderRadius: 12, 
          padding: 32, 
          minWidth: 800, 
          maxWidth: '90vw',
          maxHeight: '90vh',
          boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Header */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: 24,
            borderBottom: '1px solid #e5e7eb',
            paddingBottom: 16
          }}>
            <div style={{ 
              fontSize: 20, 
              fontWeight: 700, 
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <MdDelete size={24} />
              ผู้ใช้ที่ถูกลบ
            </div>
            <button
              onClick={onClose}
              style={{
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
              <MdClose size={24} color="#64748b" />
            </button>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflow: 'auto' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 48 }}>
                <LoadingSpinner text="กำลังโหลดข้อมูล..." />
              </div>
            ) : !deletedUsers || deletedUsers.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                color: '#64748b', 
                padding: 48,
                fontSize: 16
              }}>
                ไม่พบผู้ใช้ที่ถูกลบ
              </div>
            ) : (
              <div style={{ overflow: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: 14
                }}>
                  <thead>
                    <tr style={{ 
                      background: '#f8fafc',
                      borderBottom: '2px solid #e5e7eb'
                    }}>
                      <th style={{ 
                        padding: '12px 8px', 
                        textAlign: 'left', 
                        fontWeight: 600,
                        color: '#374151'
                      }}>ชื่อ-นามสกุล</th>
                      <th style={{ 
                        padding: '12px 8px', 
                        textAlign: 'left', 
                        fontWeight: 600,
                        color: '#374151'
                      }}>เบอร์โทร</th>
                      <th style={{ 
                        padding: '12px 8px', 
                        textAlign: 'left', 
                        fontWeight: 600,
                        color: '#374151'
                      }}>อีเมล</th>
                      <th style={{ 
                        padding: '12px 8px', 
                        textAlign: 'center', 
                        fontWeight: 600,
                        color: '#374151'
                      }}>วันที่ลบ</th>
                      <th style={{ 
                        padding: '12px 8px', 
                        textAlign: 'center', 
                        fontWeight: 600,
                        color: '#374151'
                      }}>การดำเนินการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deletedUsers.map((user) => (
                      <tr key={user.id} style={{ 
                        borderBottom: '1px solid #f3f4f6',
                        transition: 'background 0.18s'
                      }}
                      onMouseOver={e => (e.currentTarget.style.background = '#f9fafb')}
                      onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <td style={{ padding: '12px 8px' }}>
                          {user.first_name} {user.last_name}
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          {user.phone_number}
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          {user.email}
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                          {formatDateThai(user.updated_at)}
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <button
                              onClick={() => handleRestoreUser(user)}
                              style={{
                                background: '#fef3c7',
                                color: '#d97706',
                                border: '1.5px solid #f59e0b',
                                borderRadius: '6px',
                                padding: '6px 12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'background 0.18s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: 13
                              }}
                              onMouseOver={e => (e.currentTarget.style.background = '#fde68a')}
                              onMouseOut={e => (e.currentTarget.style.background = '#fef3c7')}
                            >
                              <MdRestore size={14} />
                              กู้คืน
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ 
            marginTop: 24,
            paddingTop: 16,
            borderTop: '1px solid #e5e7eb',
            textAlign: 'center',
            color: '#6b7280',
            fontSize: 14
          }}>
            จำนวนผู้ใช้ที่ถูกลบ: {deletedUsers?.length || 0} รายการ
          </div>
        </div>
      </div>

      {/* Restore Confirmation Modal */}
      {showRestoreConfirm && (
        <div style={{
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100vw', 
          height: '100vh',
          background: 'rgba(0,0,0,0.3)', 
          zIndex: 10000, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center'
        }}>
          <div style={{ 
            background: '#fff', 
            borderRadius: 12, 
            padding: 32, 
            minWidth: 400,
            boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: 18, 
              fontWeight: 600, 
              marginBottom: 16, 
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}>
              <MdRestore size={24} />
              ยืนยันการกู้คืน
            </div>
            <div style={{ marginBottom: 24, color: '#374151', lineHeight: 1.5 }}>
              คุณต้องการกู้คืนผู้ใช้ <strong>{restoreTargetUser?.first_name} {restoreTargetUser?.last_name}</strong> กลับมาใช้งานหรือไม่?
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={() => setShowRestoreConfirm(false)}
                disabled={restoring}
                style={{
                  background: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.18s',
                  fontSize: 14
                }}
                onMouseOver={e => !restoring && (e.currentTarget.style.background = '#e5e7eb')}
                onMouseOut={e => !restoring && (e.currentTarget.style.background = '#f3f4f6')}
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmRestoreUser}
                disabled={restoring}
                style={{
                  background: '#f59e0b',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontWeight: 600,
                  cursor: restoring ? 'not-allowed' : 'pointer',
                  transition: 'background 0.18s',
                  fontSize: 14,
                  opacity: restoring ? 0.6 : 1
                }}
                onMouseOver={e => !restoring && (e.currentTarget.style.background = '#d97706')}
                onMouseOut={e => !restoring && (e.currentTarget.style.background = '#f59e0b')}
              >
                {restoring ? 'กำลังกู้คืน...' : 'กู้คืน'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 