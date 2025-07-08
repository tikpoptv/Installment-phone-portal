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
    }
  }, [open]);

  if (!open) return null;

  // mock ข้อมูลประวัติการชำระเงิน
  const mockResponse = {
    remaining_balance: 14000.00,
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
          {/* ไม่ต้องมี input วันที่ชำระ */}
          <label>
            <span>จำนวนเงินที่ชำระ <span style={{ color: 'red' }}>*</span></span>
            <input type="number" min={1} value={amount} onChange={e => setAmount(e.target.value)} required style={{ width: '100%', display: 'block', marginTop: 6 }} />
          </label>
          <label>
            <span>วิธีชำระเงิน <span style={{ color: 'red' }}>*</span></span>
            <select value={method} onChange={e => setMethod(e.target.value)} required style={{ width: '100%', display: 'block', marginTop: 6 }}>
              <option value="cash">เงินสด</option>
              <option value="bank_transfer">โอนธนาคาร</option>
              <option value="online">ออนไลน์</option>
            </select>
          </label>
          <label>
            <span>อัปโหลดหลักฐาน <span style={{ color: 'red' }}>*</span></span>
            <input type="file" accept="image/*" onChange={handleProofChange} required style={{ width: '100%', display: 'block', marginTop: 6 }} />
          </label>
          {proofPreview && (
            <div style={{ position: 'relative', display: 'inline-block', marginTop: 8, maxWidth: '100%' }}>
              <img
                src={proofPreview}
                alt="ตัวอย่างหลักฐาน"
                style={{
                  width: '100%',
                  maxWidth: '100%',
                  maxHeight: 180,
                  objectFit: 'contain',
                  borderRadius: 8,
                  boxShadow: '0 1px 6px rgba(0,0,0,0.08)',
                  cursor: 'pointer',
                  filter: showPreviewModal ? 'brightness(0.7)' : 'none',
                  transition: 'filter 0.2s',
                }}
                onClick={() => setShowPreviewModal(true)}
                onMouseOver={e => (e.currentTarget.style.filter = 'brightness(0.85)')}
                onMouseOut={e => (e.currentTarget.style.filter = showPreviewModal ? 'brightness(0.7)' : 'none')}
              />
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  background: 'rgba(0,0,0,0.25)',
                  borderRadius: 8,
                  opacity: 0.85,
                  pointerEvents: 'none',
                  fontSize: 18,
                  fontWeight: 500,
                  textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                }}
              >
                คลิกเพื่อขยาย
              </div>
              {showPreviewModal && (
                <div
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(0,0,0,0.7)',
                    zIndex: 2000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onClick={() => setShowPreviewModal(false)}
                >
                  <img
                    src={proofPreview}
                    alt="ขยายหลักฐาน"
                    style={{
                      maxWidth: '90vw',
                      maxHeight: '80vh',
                      borderRadius: 12,
                      boxShadow: '0 2px 16px rgba(0,0,0,0.18)',
                      background: '#fff',
                      padding: 8,
                    }}
                    onClick={e => e.stopPropagation()}
                  />
                  <button
                    style={{
                      position: 'fixed',
                      top: 24,
                      right: 32,
                      background: 'rgba(0,0,0,0.5)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '50%',
                      width: 36,
                      height: 36,
                      fontSize: 22,
                      cursor: 'pointer',
                      zIndex: 2100,
                    }}
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
            <div><strong>ยอดคงเหลือ:</strong> {mockResponse.remaining_balance.toLocaleString()} บาท</div>
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