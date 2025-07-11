import React, { useEffect, useState } from 'react';
import styles from './PaymentModal.module.css';
import type { UserContractPaymentsResponse } from '../../../services/user/contract.service';
import { getUserContractPayments } from '../../../services/user/contract.service';
import { createUserPayment, getUserPaymentProofFile, type CreateUserPaymentPayload } from '../../../services/payment.service';
import { toast } from 'react-toastify';

type PaymentModalProps = {
  contractId: string;
  open: boolean;
  onClose: () => void;
  hasEarlyClosureDiscount?: boolean;
};

export default function PaymentModal({ contractId, open, onClose, hasEarlyClosureDiscount = false }: PaymentModalProps) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'cash' | 'bank_transfer' | 'online'>('bank_transfer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentData, setPaymentData] = useState<UserContractPaymentsResponse | null>(null);
  const [amountError, setAmountError] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string | null>(null);
  const [showProofPreviewModal, setShowProofPreviewModal] = useState(false);
  const [selectedPaymentImage, setSelectedPaymentImage] = useState<string | null>(null);
  const [showPaymentImageModal, setShowPaymentImageModal] = useState(false);

  useEffect(() => {
    if (open && contractId) {
      getUserContractPayments(contractId)
        .then((data) => setPaymentData(data))
        .catch(() => setPaymentData(null));
    } else {
      setPaymentData(null);
    }
  }, [open, contractId]);

  useEffect(() => {
    if (open) {
      setAmount('');
      setMethod('bank_transfer');
      setIsSubmitting(false);
      setAmountError('');
      setProofFile(null);
      setProofPreviewUrl(null);
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [open]);

  // Auto กรอกจำนวนเงินเมื่อมี early_closure discount
  useEffect(() => {
    if (hasEarlyClosureDiscount && paymentData?.remaining_balance) {
      setAmount(paymentData.remaining_balance.toString());
    }
  }, [hasEarlyClosureDiscount, paymentData?.remaining_balance]);

  // Cleanup proofPreviewUrl when component unmounts
  useEffect(() => {
    return () => {
      if (proofPreviewUrl) {
        URL.revokeObjectURL(proofPreviewUrl);
      }
    };
  }, [proofPreviewUrl]);

  // Cleanup payment image URL when component unmounts
  useEffect(() => {
    return () => {
      if (selectedPaymentImage) {
        URL.revokeObjectURL(selectedPaymentImage);
      }
    };
  }, [selectedPaymentImage]);

  if (!open) return null;

  const methodLabel: Record<string, string> = {
    cash: 'เงินสด',
    bank_transfer: 'โอนธนาคาร',
    online: 'ออนไลน์',
  };
  
  const statusLabel: Record<string, string> = {
    approved: 'อนุมัติ',
    pending: 'รอตรวจสอบ',
    rejected: 'ไม่อนุมัติ',
  };

  const installmentStatusLabel: Record<string, string> = {
    paid: 'ชำระแล้ว',
    unpaid: 'ยังไม่ชำระ',
    overdue: 'ค้างชำระ',
    partial: 'ชำระบางส่วน'
  };

  function formatDate(dateStr: string) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', { year: '2-digit', month: 'short', day: 'numeric' });
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProofFile(file);
      const url = URL.createObjectURL(file);
      setProofPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !paymentData || amountError) return;
    setIsSubmitting(true);
    try {
      const payload: CreateUserPaymentPayload = {
        contract_id: contractId,
        payment_date: new Date().toISOString().split('T')[0],
        amount: Number(amount),
        method,
        proof_file: proofFile,
      };
      
      await createUserPayment(payload);
      toast.success('แจ้งชำระเงินสำเร็จ! ระบบจะตรวจสอบและอัปเดตสถานะในภายหลัง');
      onClose();
    } catch (error) {
      console.error('Payment submission error:', error);
      toast.error('เกิดข้อผิดพลาดในการแจ้งชำระเงิน กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);
    
    // Clear error when user starts typing
    if (amountError) {
      setAmountError('');
    }
    
    // Validate amount
    if (value && paymentData?.remaining_balance) {
      const numValue = Number(value);
      if (numValue > paymentData.remaining_balance) {
        setAmountError(`จำนวนเงินไม่สามารถเกิน ${paymentData.remaining_balance.toLocaleString()} บาท`);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return styles['status-approved'];
      case 'pending': return styles['status-pending'];
      case 'rejected': return styles['status-rejected'];
      case 'paid': return styles['status-approved'];
      case 'unpaid': return styles['status-pending'];
      case 'overdue': return styles['status-rejected'];
      case 'partial': return styles['status-partial'];
      default: return '';
    }
  };

  const handleViewPaymentImage = async (paymentId: string, filename: string) => {
    try {
      const blob = await getUserPaymentProofFile(paymentId, filename);
      const url = URL.createObjectURL(blob);
      setSelectedPaymentImage(url);
      setShowPaymentImageModal(true);
    } catch (error) {
      console.error('View image error:', error);
      toast.error('ไม่สามารถดูภาพได้');
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <h2>
          {hasEarlyClosureDiscount ? 'แจ้งชำระเงิน (ปิดยอด)' : 'แจ้งชำระเงิน'}
        </h2>
        {/* สรุปข้อมูลสัญญา */}
        <div className={styles.summaryBox} style={{ marginBottom: 24 }}>
          <div><strong>ยอดผ่อนต่อเดือน:</strong> {paymentData?.monthly_payment?.toLocaleString() ?? '-'} บาท</div>
          <div><strong>งวดที่จ่ายไปแล้ว:</strong> {paymentData?.paid_installments ?? '-'} งวด</div>
          <div><strong>วันที่ชำระล่าสุด:</strong> {paymentData?.last_payment_date ? formatDate(paymentData.last_payment_date) : '-'}</div>
          {hasEarlyClosureDiscount && (
            <div style={{ color: '#7c3aed', fontWeight: 600 }}>
              <strong>โปรโมชั่นปิดยอด:</strong> แจ้งชำระปิดยอด
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit}>
          <label className={styles.formLabel}>
            <span>จำนวนเงินที่ชำระ <span style={{ color: 'red' }}>*</span></span>
            <input 
              type="number" 
              min={1} 
              max={paymentData?.remaining_balance}
              value={amount} 
              onChange={handleAmountChange} 
              required 
              className={styles.formInput}
              placeholder="กรอกจำนวนเงินที่ชำระ"
              disabled={hasEarlyClosureDiscount}
            />
            {amountError && (
              <div style={{ color: 'red', fontSize: '0.9em', marginTop: '4px' }}>
                {amountError}
              </div>
            )}
            {hasEarlyClosureDiscount && (
              <div style={{ color: '#7c3aed', fontSize: '0.9em', marginTop: '4px', fontStyle: 'italic' }}>
                💡 จำนวนเงินถูกกำหนดอัตโนมัติสำหรับโปรโมชั่นปิดยอด
              </div>
            )}
          </label>
          <label className={styles.formLabel}>
            <span>วิธีชำระเงิน <span style={{ color: 'red' }}>*</span></span>
            <select 
              value={method} 
              onChange={e => setMethod(e.target.value as 'cash' | 'bank_transfer' | 'online')} 
              required 
              className={styles.formSelect}
              disabled
            >
              <option value="bank_transfer">โอนธนาคาร</option>
            </select>
          </label>
          <label className={styles.formLabel}>
            <span>หลักฐานการชำระเงิน (สลิปโอนเงิน) <span style={{ color: 'red' }}>*</span></span>
            <input 
              type="file" 
              accept="image/*"
              onChange={handleFileChange}
              required 
              className={styles.formInput}
            />
          </label>
          {proofFile && proofPreviewUrl && (
            <div className={styles.proofPreview}>
              <div style={{ color: '#0ea5e9', fontSize: 14, marginBottom: 8, fontWeight: 500 }}>
                📎 ไฟล์: {proofFile.name}
              </div>
              <img 
                src={proofPreviewUrl} 
                alt="Proof" 
                className={styles.proofImage}
                onClick={() => setShowProofPreviewModal(true)}
              />
              <div className={styles.proofHint}>
                คลิกเพื่อดูขนาดใหญ่
              </div>
            </div>
          )}
          <div className={styles.buttonRow}>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'กำลังส่งข้อมูล...' : 'ยืนยัน'}
            </button>
            <button type="button" onClick={onClose} disabled={isSubmitting}>ยกเลิก</button>
          </div>
        </form>
        {/* ตารางงวดผ่อน */}
        <div className={styles.paymentHistory}>
          <h3>ตารางงวดผ่อน</h3>
          <div className={styles.tableContainer}>
            <table className={styles.paymentTable}>
              <thead>
                <tr>
                  <th>งวดที่</th>
                  <th>ครบกำหนด</th>
                  <th className={styles.amountCol}>จำนวนเงิน</th>
                  <th className={styles.paidCol}>ชำระแล้ว</th>
                  <th>สถานะ</th>
                  <th>หมายเหตุ</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(paymentData?.installments) && paymentData.installments.map((installment) => (
                  <tr key={installment.id}>
                    <td>{installment.installment_number}</td>
                    <td>{formatDate(installment.due_date)}</td>
                    <td className={styles.amountCol}>{installment.amount.toLocaleString()} บาท</td>
                    <td className={styles.paidCol}>{installment.amount_paid.toLocaleString()} บาท</td>
                    <td className={getStatusColor(installment.status)}>
                      {installmentStatusLabel[installment.status] || '-'}
                    </td>
                    <td style={{ fontSize: '0.9em', color: '#666' }}>{installment.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* ประวัติการชำระเงิน */}
        <div className={styles.paymentHistory}>
          <h3>ประวัติการชำระเงิน</h3>
          {Array.isArray(paymentData?.payments) && paymentData.payments.length > 0 ? (
            <div className={styles.tableContainer}>
              <table className={styles.paymentTable}>
                <thead>
                  <tr>
                    <th>วันที่ชำระ</th>
                    <th>จำนวนเงิน</th>
                    <th>วิธี</th>
                    <th>หลักฐาน</th>
                    <th>สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentData.payments.map((item) => (
                    <tr key={item.id}>
                      <td>{formatDate(item.payment_date)}</td>
                      <td style={{ textAlign: 'right' }}>{item.amount.toLocaleString()} บาท</td>
                      <td>{methodLabel[item.method] || '-'}</td>
                      <td>
                        {item.proof_file_filename ? (
                          <button
                            type="button"
                            onClick={() => handleViewPaymentImage(item.id, item.proof_file_filename!)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#0ea5e9',
                              textDecoration: 'underline',
                              cursor: 'pointer',
                              fontSize: '0.9em'
                            }}
                          >
                            ดูภาพ
                          </button>
                        ) : '-'}
                      </td>
                      <td className={getStatusColor(item.verify_status)}>
                        {statusLabel[item.verify_status] || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
              ไม่มีประวัติ
            </div>
          )}
        </div>
      </div>
      {showProofPreviewModal && proofPreviewUrl && (
        <div className={styles.previewModal}>
          <button 
            onClick={() => setShowProofPreviewModal(false)} 
            className={styles.closePreviewBtn}
            aria-label="ปิด"
          >
            ×
          </button>
          <img src={proofPreviewUrl} alt="Proof" className={styles.previewImage} />
        </div>
      )}
      {showPaymentImageModal && selectedPaymentImage && (
        <div className={styles.previewModal}>
          <button 
            onClick={() => setShowPaymentImageModal(false)} 
            className={styles.closePreviewBtn}
            aria-label="ปิด"
          >
            ×
          </button>
          <img src={selectedPaymentImage} alt="Payment Proof" className={styles.previewImage} />
        </div>
      )}
    </div>
  );
} 