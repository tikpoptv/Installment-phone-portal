import React, { useEffect, useState } from 'react';
import styles from './IcloudDetailModal.module.css';
import { FaPencilAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { updateIcloudCredential, getIcloudCredentialDetail } from '../../../services/icloud.service';
import type { IcloudCredentialDetail } from '../../../services/icloud.service';

interface IcloudDetailModalProps {
  open: boolean;
  onClose: () => void;
  icloudId: string | null;
}

const IcloudDetailModal: React.FC<IcloudDetailModalProps> = ({ open, onClose, icloudId }) => {
  const [data, setData] = useState<IcloudCredentialDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    icloud_username: '',
    icloud_password: '',
    note: '',
  });
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (open && icloudId) {
      setLoading(true);
      getIcloudCredentialDetail(icloudId)
        .then(res => {
          setData(res);
          setEditMode(false);
        })
        .catch(() => {
          setData(null);
        })
        .finally(() => setLoading(false));
    } else {
      setData(null);
      setEditMode(false);
    }
  }, [open, icloudId]);

  useEffect(() => {
    if (data) {
      setEditForm({
        icloud_username: data.icloud_username,
        icloud_password: data.icloud_password,
        note: data.note || '',
      });
    }
  }, [data]);

  useEffect(() => {
    if (showConfirm) {
      setSaveError(null);
      setSaving(false);
    }
  }, [showConfirm]);

  if (!open) return null;

  return (
    <div className={styles.detailModalOverlay}>
      <div className={styles.detailModalContent}>
        <button
          type="button"
          className={styles.detailModalCloseButton}
          onClick={onClose}
          aria-label="ปิด"
        >
          ×
        </button>
        <h2 className={styles.detailModalTitle}>รายละเอียดบัญชี iCloud</h2>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 32 }}>กำลังโหลดข้อมูล...</div>
        ) : data ? (
          <div style={{ marginTop: 12 }}>
            <div className={styles.detailModalLabelRow}><span className={styles.detailModalLabelText}>ID</span></div>
            <div className={styles.detailModalInput}>{data.id}</div>
            <div className={styles.detailModalLabelRow}><span className={styles.detailModalLabelText}>ประเภทเจ้าของ</span></div>
            <div className={styles.detailModalInput}>{data.owner_type === 'customer' ? 'ลูกค้า' : 'ร้านค้า'}</div>
            <div className={styles.detailModalLabelRow}><span className={styles.detailModalLabelText}>ชื่อผู้ใช้ iCloud</span></div>
            {editMode ? (
              <div className={styles.detailModalEditSection}>
                <input
                  className={styles.detailModalEditInput}
                  value={editForm.icloud_username}
                  onChange={e => setEditForm(f => ({ ...f, icloud_username: e.target.value }))}
                  autoFocus
                  placeholder="ชื่อผู้ใช้ iCloud"
                />
                <div className={styles.detailModalLabelRow}><span className={styles.detailModalLabelText}>รหัสผ่าน iCloud</span></div>
                <input
                  className={styles.detailModalEditInput}
                  value={editForm.icloud_password}
                  onChange={e => setEditForm(f => ({ ...f, icloud_password: e.target.value }))}
                  type="text"
                  placeholder="รหัสผ่าน iCloud"
                />
                <div className={styles.detailModalLabelRow}><span className={styles.detailModalLabelText}>หมายเหตุ</span></div>
                <input
                  className={styles.detailModalEditInput}
                  value={editForm.note}
                  onChange={e => setEditForm(f => ({ ...f, note: e.target.value }))}
                  placeholder="หมายเหตุ (ถ้ามี)"
                />
              </div>
            ) : (
              <div className={styles.detailModalInput}>{data.icloud_username}</div>
            )}
            {!editMode && (
              <>
                <div className={styles.detailModalLabelRow}><span className={styles.detailModalLabelText}>รหัสผ่าน iCloud</span></div>
                <div className={styles.detailModalInput}>{data.icloud_password}</div>
                <div className={styles.detailModalLabelRow}><span className={styles.detailModalLabelText}>หมายเหตุ</span></div>
                <div className={styles.detailModalInput}>{data.note || '-'}</div>
              </>
            )}
            <div className={styles.detailModalLabelRow}><span className={styles.detailModalLabelText}>วันที่สร้าง</span></div>
            <div className={styles.detailModalInput}>{new Date(data.created_at).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })}</div>
            <div className={styles.detailModalLabelRow}><span className={styles.detailModalLabelText}>อัปเดตล่าสุด</span></div>
            <div className={styles.detailModalInput}>{new Date(data.updated_at).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })}</div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24, gap: 10 }}>
              {editMode ? (
                <>
                  <button
                    type="button"
                    className={styles.detailModalEditButton}
                    style={{ background: '#64748b' }}
                    onClick={() => setEditMode(false)}
                    disabled={saving}
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="button"
                    className={styles.detailModalEditButton}
                    style={{ background: '#0ea5e9' }}
                    onClick={() => setShowConfirm(true)}
                    disabled={saving}
                  >
                    {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className={styles.detailModalEditButton}
                  onClick={() => setEditMode(true)}
                >
                  <FaPencilAlt size={17} style={{ marginBottom: -2 }} /> แก้ไข
                </button>
              )}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 32, color: '#64748b' }}>ไม่พบข้อมูล</div>
        )}
      </div>
      {showConfirm && (
        <div className={styles.confirmOverlay}>
          <div className={styles.confirmBox}>
            <div className={styles.confirmTitle}>ยืนยันการบันทึกข้อมูล</div>
            <div className={styles.confirmMsg}>
              คุณต้องการบันทึกการแก้ไขข้อมูลนี้ใช่หรือไม่?<br />
              <span style={{ color: '#64748b', fontWeight: 500 }}>หากบันทึกแล้ว คุณสามารถแก้ไขข้อมูลนี้ได้อีกในภายหลัง</span>
            </div>
            <div className={styles.confirmBtnRow}>
              <button
                className={styles.confirmBtn + ' ' + styles.confirmBtnCancel}
                onClick={() => setShowConfirm(false)}
                disabled={saving}
              >ยกเลิก</button>
              <button
                className={styles.confirmBtn + ' ' + styles.confirmBtnOk}
                onClick={async () => {
                  setSaveError(null);
                  setSaving(true);
                  try {
                    await updateIcloudCredential(data!.id, {
                      owner_type: data!.owner_type,
                      icloud_username: editForm.icloud_username,
                      icloud_password: editForm.icloud_password || undefined,
                      note: editForm.note || undefined,
                    });
                    const refreshed = await getIcloudCredentialDetail(data!.id);
                    setData(refreshed);
                    setEditMode(false);
                    setShowConfirm(false);
                    toast.success('บันทึกข้อมูลสำเร็จ');
                  } catch (err: unknown) {
                    let msg = 'เกิดข้อผิดพลาดในการบันทึกข้อมูล';
                    let rawMsg = '';
                    if (
                      err && typeof err === 'object'
                    ) {
                      if ('message' in err && typeof (err as { message?: unknown }).message === 'string') {
                        rawMsg = (err as { message: string }).message;
                      } else if ('error' in err && typeof (err as { error?: unknown }).error === 'string') {
                        rawMsg = (err as { error: string }).error;
                      }
                    }
                    const rawLower = (rawMsg || '').toLowerCase();
                    if (
                      rawLower.includes('icloud_username_unique') ||
                      rawLower.includes('sqlstate 23505') ||
                      rawLower.includes('duplicate key')
                    ) {
                      msg = 'ชื่อผู้ใช้ iCloud นี้ถูกใช้งานแล้ว';
                    } else if (rawMsg) {
                      msg = rawMsg;
                    }
                    setSaveError(msg);
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving}
              >ยืนยัน</button>
            </div>
            {saveError && <div style={{ color: '#ef4444', marginTop: 12 }}>{saveError}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default IcloudDetailModal; 