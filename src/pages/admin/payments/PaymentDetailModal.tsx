import React, { useEffect, useState } from 'react';
import styles from './PaymentDetailModal.module.css';
import { Link } from 'react-router-dom';
import { getPaymentDetail, getPaymentProofFile, verifyPayment } from '../../../services/payment.service';
import type { PaymentDetail } from '../../../services/payment.service';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../../components/LoadingSpinner';

interface PaymentDetailModalProps {
  open: boolean;
  paymentId: string | null;
  onClose: () => void;
  onActionSuccess?: () => void;
}

function formatDate(dateStr: string) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const PaymentDetailModal: React.FC<PaymentDetailModalProps> = ({ open, paymentId, onClose, onActionSuccess }) => {
  const [data, setData] = useState<PaymentDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showSlipPreview, setShowSlipPreview] = useState(false);

  useEffect(() => {
    if (!open || !paymentId) return;
    setLoading(true);
    setError(null);
    setData(null);
    setProofUrl(null);
    getPaymentDetail(paymentId)
      .then(async (d) => {
        setData(d);
        if (d.proof_file_filename) {
          try {
            const blob = await getPaymentProofFile(d.id, d.proof_file_filename);
            setProofUrl(URL.createObjectURL(blob));
          } catch {
            setProofUrl(null);
          }
        }
      })
      .catch(() => setError('ไม่พบข้อมูล'))
      .finally(() => setLoading(false));
  }, [open, paymentId]);

  useEffect(() => {
    return () => {
      if (proofUrl) URL.revokeObjectURL(proofUrl);
    };
  }, [proofUrl]);

  const getAdminId = () => {
    const userStr = localStorage.getItem('auth_user');
    if (!userStr) return '';
    try {
      const user = JSON.parse(userStr);
      return user.id || user.ID || '';
    } catch {
      return '';
    }
  };

  const handleApprove = async () => {
    if (!data) return;
    const admin_id = getAdminId();
    if (!admin_id) {
      toast.error('ไม่พบข้อมูลผู้ดูแลระบบ');
      return;
    }
    setActionLoading(true);
    try {
      await verifyPayment(data.id, 'approved', admin_id);
      toast.success('ยืนยันการชำระเงินสำเร็จ');
      if (onActionSuccess) onActionSuccess();
      // refresh ข้อมูลใหม่ใน modal
      const d = await getPaymentDetail(data.id);
      setData(d);
      if (d.proof_file_filename) {
        try {
          const blob = await getPaymentProofFile(d.id, d.proof_file_filename);
          setProofUrl(URL.createObjectURL(blob));
        } catch {
          setProofUrl(null);
        }
      }
    } catch {
      toast.error('เกิดข้อผิดพลาดในการยืนยัน');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!data) return;
    const admin_id = getAdminId();
    if (!admin_id) {
      toast.error('ไม่พบข้อมูลผู้ดูแลระบบ');
      return;
    }
    setActionLoading(true);
    try {
      await verifyPayment(data.id, 'rejected', admin_id);
      toast.success('ไม่อนุมัติรายการสำเร็จ');
      if (onActionSuccess) onActionSuccess();
      // refresh ข้อมูลใหม่ใน modal
      const d = await getPaymentDetail(data.id);
      setData(d);
      if (d.proof_file_filename) {
        try {
          const blob = await getPaymentProofFile(d.id, d.proof_file_filename);
          setProofUrl(URL.createObjectURL(blob));
        } catch {
          setProofUrl(null);
        }
      }
    } catch {
      toast.error('เกิดข้อผิดพลาดในการยกเลิก');
    } finally {
      setActionLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="ปิด">×</button>
        <h2 className={styles.title}>รายละเอียดการชำระเงิน</h2>
        {loading ? (
          <div style={{ padding: 32, textAlign: 'center' }}><LoadingSpinner text="กำลังโหลดข้อมูล..." size={36} /></div>
        ) : error ? (
          <div className={styles.errorText}>{error}</div>
        ) : data && (
          <div className={styles.detailBody}>
            <div className={styles.infoBox}>
              <div className={styles.infoId}>เลขที่ชำระ: <span>{data.id}</span></div>
              <div className={styles.infoContract}>
                รหัสคำสั่งซื้อ:
                <Link to={`/admin/orders/${data.contract_id}`} className={styles.contractLink} target="_blank" rel="noopener noreferrer">
                  {data.contract_id}
                </Link>
              </div>
              <div className={styles.infoRow}><span>วันที่ชำระ:</span> <b>{formatDate(data.payment_date)}</b></div>
              <div className={styles.infoRow}><span>จำนวนเงิน:</span> <b className={styles.infoAmount}>{data.amount.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}</b></div>
              <div className={styles.infoRow}><span>วิธีชำระ:</span> <b>{data.method}</b></div>
              <div className={styles.infoRow}><span>สถานะ:</span> <b className={
                data.verify_status === 'verified' ? styles.statusVerified :
                data.verify_status === 'rejected' ? styles.statusRejected :
                styles.statusPending
              }>{data.verify_status}</b></div>
              <hr className={styles.divider} />
              {data.verify_by_name && (
                <div className={styles.infoVerifier}>
                  ตรวจสอบโดย: <span>{data.verify_by_name}</span>
                  {data.verify_by && (
                    <span style={{ color: '#64748b', fontWeight: 500, marginLeft: 6 }}>({data.verify_by})</span>
                  )}
                </div>
              )}
              <div className={styles.infoMeta}>สร้างเมื่อ: {formatDate(data.created_at)}<span className={styles.metaSep}>|</span>อัปเดตล่าสุด: {formatDate(data.updated_at)}</div>
            </div>
            {data.proof_file_filename && proofUrl && (
              <div className={styles.slipBox}>
                <div className={styles.slipTitle}>สลิป/หลักฐานการชำระเงิน</div>
                <img src={proofUrl} alt="slip" className={styles.slipImg} style={{ cursor: 'zoom-in' }} onClick={() => setShowSlipPreview(true)} />
                <div className={styles.slipDownloadRow}>
                  <a href={proofUrl} download={data.proof_file_filename} className={styles.slipDownload}>ดาวน์โหลดไฟล์</a>
                </div>
                {data.verify_status === 'pending' && (
                  <div className={styles.actionRow}>
                    <button className={styles.approveBtn} onClick={handleApprove} disabled={actionLoading}>{actionLoading ? 'กำลังยืนยัน...' : 'ยืนยัน'}</button>
                    <button className={styles.rejectBtn} onClick={handleReject} disabled={actionLoading}>{actionLoading ? 'กำลังไม่อนุมัติ...' : 'ไม่อนุมัติ'}</button>
                  </div>
                )}
              </div>
            )}
            {!data.proof_file_filename && data.verify_status === 'pending' && (
              <div className={styles.actionRow}>
                <button className={styles.approveBtn} onClick={handleApprove} disabled={actionLoading}>{actionLoading ? 'กำลังยืนยัน...' : 'ยืนยัน'}</button>
                <button className={styles.rejectBtn} onClick={handleReject} disabled={actionLoading}>{actionLoading ? 'กำลังไม่อนุมัติ...' : 'ไม่อนุมัติ'}</button>
              </div>
            )}
          </div>
        )}
      </div>
      {showSlipPreview && proofUrl && (
        <div className={styles.modalBackdrop} style={{ zIndex: 4000 }}>
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <button onClick={() => setShowSlipPreview(false)} style={{ position: 'absolute', top: 8, right: 8, zIndex: 2, background: '#fff', border: 'none', borderRadius: '50%', fontSize: 28, width: 40, height: 40, boxShadow: '0 2px 8px #bae6fd55', cursor: 'pointer', color: '#0ea5e9' }} aria-label="ปิด">×</button>
            <img src={proofUrl} alt="slip-large" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 16, boxShadow: '0 4px 32px #bae6fd88' }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentDetailModal; 