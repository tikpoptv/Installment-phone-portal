import React, { useState } from 'react';
import styles from './PaymentModal.module.css';

type PaymentFormData = {
  contract_id: string;
  payment_date?: string;
  amount: number;
  method: string;
  proof_file: File | null;
};

type PaymentModalProps = {
  contractId: string;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PaymentFormData) => void; // ใช้ type ที่เหมาะสม
};

export default function PaymentModal({ contractId, open, onClose, onSubmit }: PaymentModalProps) {
  // const [paymentDate, setPaymentDate] = useState(''); // ไม่ต้องใช้แล้ว
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('cash');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  React.useEffect(() => {
    if (open) {
      setAmount('');
      setMethod('cash');
      setProofFile(null);
      setProofPreview(null);
      setShowPreviewModal(false);
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [open]);

  if (!open) return null;

  // mock ข้อมูลประวัติการชำระเงิน
  const mockResponse = {
    monthly_payment: 1833.33,
    paid_installments: 3,
    last_payment_date: '2024-08-15T00:00:00Z',
    payments: [
      {
        id: 'PM00001',
        payment_date: '2024-07-15T00:00:00Z',
        amount: 2000.00,
        method: 'bank_transfer',
        proof_file_filename: 'PM00001.jpg',
        verify_status: 'approved',
        created_at: '2024-07-15T12:00:00Z',
      },
      {
        id: 'PM00002',
        payment_date: '2024-08-15T00:00:00Z',
        amount: 1833.33,
        method: 'cash',
        proof_file_filename: null,
        verify_status: 'pending',
        created_at: '2024-08-15T12:00:00Z',
      },
    ],
  };

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

  function formatDate(dateStr: string) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', { year: '2-digit', month: 'short', day: 'numeric' });
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      contract_id: contractId,
      payment_date: '', // หรือ undefined ก็ได้ เดี๋ยวฝั่ง backend กรอกให้
      amount: Number(amount),
      method,
      proof_file: proofFile,
    });
  };

  const handleProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setProofFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => setProofPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setProofPreview(null);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <h2>แจ้งชำระเงิน</h2>
        <form onSubmit={handleSubmit}>
          <label className={styles.formLabel}>
            <span>จำนวนเงินที่ชำระ <span style={{ color: 'red' }}>*</span></span>
            <input 
              type="number" 
              min={1} 
              value={amount} 
              onChange={e => setAmount(e.target.value)} 
              required 
              className={styles.formInput}
            />
          </label>
          <label className={styles.formLabel}>
            <span>วิธีชำระเงิน <span style={{ color: 'red' }}>*</span></span>
            <select 
              value={method} 
              onChange={e => setMethod(e.target.value)} 
              required 
              className={styles.formSelect}
            >
              <option value="cash">เงินสด</option>
              <option value="bank_transfer">โอนธนาคาร</option>
              <option value="online">ออนไลน์</option>
            </select>
          </label>
          <label className={styles.formLabel}>
            <span>อัปโหลดหลักฐาน <span style={{ color: 'red' }}>*</span></span>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleProofChange} 
              required 
              className={styles.formFileInput}
            />
          </label>
          {proofPreview && (
            <div className={styles.proofPreview}>
              <img
                src={proofPreview}
                alt="ตัวอย่างหลักฐาน"
                className={styles.proofImage}
                onClick={() => setShowPreviewModal(true)}
              />
              <div className={styles.proofOverlay}>
                คลิกเพื่อขยาย
              </div>
              {showPreviewModal && (
                <div className={styles.previewModal} onClick={() => setShowPreviewModal(false)}>
                  <img
                    src={proofPreview}
                    alt="ขยายหลักฐาน"
                    className={styles.previewImage}
                    onClick={e => e.stopPropagation()}
                  />
                  <button
                    className={styles.closePreviewBtn}
                    onClick={() => setShowPreviewModal(false)}
                    aria-label="ปิดภาพ"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          )}
          <div className={styles.buttonRow}>
            <button type="submit">ยืนยัน</button>
            <button type="button" onClick={onClose}>ยกเลิก</button>
          </div>
        </form>
        {/* ตารางประวัติการชำระเงิน */}
        <div className={styles.paymentHistory}>
          <div className={styles.summaryBox} style={{ marginTop: 0, marginBottom: 18 }}>
            <div><strong>จำนวนเงินที่ต้องจ่าย/เดือน:</strong> {mockResponse.monthly_payment.toLocaleString()} บาท</div>
            <div><strong>งวดที่จ่ายไปแล้ว:</strong> {mockResponse.paid_installments} งวด</div>
            <div><strong>วันที่จ่ายล่าสุด:</strong> {formatDate(mockResponse.last_payment_date)}</div>
          </div>
          <h3>ประวัติการชำระเงิน</h3>
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
              {mockResponse.payments.map((item) => (
                <tr key={item.id}>
                  <td>{formatDate(item.payment_date)}</td>
                  <td style={{ textAlign: 'right' }}>{item.amount.toLocaleString()} บาท</td>
                  <td>{methodLabel[item.method] || '-'}</td>
                  <td>{item.proof_file_filename ? <a href={`#`} target="_blank" rel="noopener noreferrer">ดูไฟล์</a> : '-'}</td>
                  <td className={
                    item.verify_status === 'approved' ? styles['status-approved'] :
                    item.verify_status === 'pending' ? styles['status-pending'] :
                    item.verify_status === 'rejected' ? styles['status-rejected'] : ''
                  }>
                    {statusLabel[item.verify_status] || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 