import React, { useState, useEffect, useRef } from 'react';
import { createPayment } from '../../../services/payment.service';
import type { CreatePaymentPayload } from '../../../services/payment.service';
import styles from './PaymentCreateModal.module.css';
import { toast } from 'react-toastify';
import { getContracts } from '../../../services/contract.service';
import type { Contract } from '../../../services/contract.service';

interface PaymentCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const methodOptions = [
  { value: 'bank_transfer', label: 'โอนเงิน' },
  { value: 'cash', label: 'เงินสด' },
  { value: 'online', label: 'ออนไลน์' },
];

const PaymentCreateModal: React.FC<PaymentCreateModalProps> = ({ open, onClose, onSuccess }) => {
  const [form, setForm] = useState<CreatePaymentPayload>({
    contract_id: '',
    payment_date: '',
    amount: 0,
    method: 'bank_transfer',
    proof_file: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contractList, setContractList] = useState<Contract[]>([]);
  const [contractQuery, setContractQuery] = useState('');
  const [showContractList, setShowContractList] = useState(false);
  const contractInputRef = useRef<HTMLInputElement | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string | null>(null);
  const [showProofPreviewModal, setShowProofPreviewModal] = useState(false);

  useEffect(() => {
    if (!open) return;
    getContracts().then(data => setContractList(data ?? []));
    setContractQuery('');
    setShowContractList(false);
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    setForm(prev => ({ ...prev, payment_date: todayStr }));
  }, [open]);

  if (!open) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'amount' ? Number(value) : value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProofFile(file);
      setForm(prev => ({ ...prev, proof_file: file }));
      const url = URL.createObjectURL(file);
      setProofPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!form.contract_id || !form.payment_date || !form.amount || !form.method) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    setIsSubmitting(true);
    try {
      await createPayment(form);
      toast.success('เพิ่มรายการชำระเงินสำเร็จ!');
      if (onSuccess) onSuccess();
      onClose();
    } catch {
      toast.error('เกิดข้อผิดพลาดในการเพิ่มรายการชำระเงิน');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="ปิด">×</button>
        <h2 className={styles.title}>เพิ่มรายการชำระเงิน</h2>
        <form onSubmit={handleSubmit} className={styles.form} autoComplete="off">
          <div style={{ position: 'relative' }}>
            <label>รหัสคำสั่งซื้อ (Contract ID) <span className={styles.required}>*</span></label>
            <input
              type="text"
              name="contract_id"
              value={contractQuery}
              onChange={e => {
                setContractQuery(e.target.value);
                setShowContractList(true);
                setForm(prev => ({ ...prev, contract_id: '' }));
              }}
              onFocus={() => setShowContractList(true)}
              onBlur={() => setTimeout(() => setShowContractList(false), 120)}
              ref={contractInputRef}
              className={styles.inputBox}
              placeholder="ค้นหารหัส/ชื่อผู้เช่า/สินค้า..."
              autoComplete="off"
              required
            />
            {showContractList && contractList.length > 0 && (
              <div className={styles.contractDropdown}>
                {contractList
                  .filter(c =>
                    (c.id + ' ' + c.user_name + ' ' + c.product_name)
                      .toLowerCase().includes(contractQuery.toLowerCase())
                  )
                  .slice(0, 20)
                  .map(c => (
                    <div
                      key={c.id}
                      className={styles.contractDropdownItem}
                      onMouseDown={() => {
                        setForm(prev => ({ ...prev, contract_id: c.id }));
                        setContractQuery(`${c.id} - ${c.user_name} - ${c.product_name}`);
                        setShowContractList(false);
                      }}
                    >
                      <div><b>{c.id}</b> <span style={{color:'#64748b',fontWeight:400}}>- {c.user_name} - {c.product_name}</span></div>
                      <div className={styles.contractDropdownItemSub}>สถานะ: {c.status} | เริ่ม: {c.start_date} | สิ้นสุด: {c.end_date}</div>
                    </div>
                  ))
                }
                {contractList.filter(c => (c.id + ' ' + c.user_name + ' ' + c.product_name).toLowerCase().includes(contractQuery.toLowerCase())).length === 0 && (
                  <div className={styles.contractDropdownEmpty}>ไม่พบคำสั่งซื้อ</div>
                )}
              </div>
            )}
          </div>
          <div>
            <label>วันที่ชำระเงิน <span className={styles.required}>*</span></label>
            <input
              name="payment_date"
              type="date"
              value={form.payment_date}
              onChange={handleChange}
              className={styles.inputBox}
              required
            />
          </div>
          <div>
            <label>จำนวนเงิน <span className={styles.required}>*</span></label>
            <input
              name="amount"
              type="number"
              min={0}
              value={form.amount}
              onChange={handleChange}
              className={styles.inputBox}
              required
            />
          </div>
          <div>
            <label>วิธีชำระเงิน <span className={styles.required}>*</span></label>
            <select
              name="method"
              value={form.method}
              onChange={handleChange}
              className={styles.inputBox}
              required
            >
              {methodOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div>
            <label>หลักฐานการชำระเงิน (อัปโหลดไฟล์ภาพ)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className={styles.inputBox}
            />
            {proofFile && proofPreviewUrl && (
              <div style={{ marginTop: 6, color: '#0ea5e9', fontSize: 14 }}>
                ไฟล์: {proofFile.name}
                <button
                  type="button"
                  onClick={() => setShowProofPreviewModal(true)}
                  style={{
                    marginLeft: 10,
                    background: '#0ea5e9',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '2px 10px',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 1px 4px #bae6fd',
                    verticalAlign: 'middle',
                    lineHeight: 1.5
                  }}
                >ดูรูปหลักฐาน</button>
              </div>
            )}
          </div>
          <div className={styles.buttonRow}>
            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
              {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>ยกเลิก</button>
          </div>
        </form>
      </div>
      {showProofPreviewModal && proofPreviewUrl && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(30,41,59,0.5)', zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ background: '#fff', borderRadius: 12, maxWidth: 600, width: '95vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #e5e7eb', fontWeight: 'bold', background: '#f1f5f9' }}>
              <span>แสดงรูปหลักฐานการชำระเงิน</span>
              <button onClick={() => setShowProofPreviewModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#64748b', cursor: 'pointer', padding: '4px 8px' }}>&times;</button>
            </div>
            <div style={{ padding: 0, flex: 1, overflow: 'auto', background: '#f9fafb', minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={proofPreviewUrl} alt="Proof" style={{ maxWidth: '100%', maxHeight: 500, borderRadius: 8, boxShadow: '0 2px 12px #bae6fd22' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentCreateModal; 