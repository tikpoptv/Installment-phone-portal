import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { postDiscountToContract, type Discount } from '../../../services/contract.service';

interface DiscountModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  contractId: string;
  rentalCost: number;
  discounts: Discount[];
}

const DiscountModal: React.FC<DiscountModalProps> = ({ open, onClose, onSuccess, contractId, rentalCost, discounts }) => {
  const [discountType, setDiscountType] = useState<'early_closure' | 'custom_offer'>('early_closure');
  const [discountAmount, setDiscountAmount] = useState('');
  const [finalAmount, setFinalAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Auto-calc finalAmount when discountAmount changes
  React.useEffect(() => {
    if (!open) return;
    const discount = parseFloat(discountAmount);
    if (!isNaN(discount)) {
      // ใช้ final_amount ล่าสุดจาก discounts หรือ rentalCost ถ้าไม่มี discounts
      const latestFinalAmount = discounts.length > 0 ? discounts[discounts.length - 1].final_amount : rentalCost;
      setFinalAmount((latestFinalAmount - discount).toFixed(2));
    } else {
      const latestFinalAmount = discounts.length > 0 ? discounts[discounts.length - 1].final_amount : rentalCost;
      setFinalAmount(latestFinalAmount.toFixed(2));
    }
  }, [discountAmount, rentalCost, open, discounts]);

  if (!open) return null;

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (!discountAmount || !finalAmount) {
      setError('กรุณากรอกจำนวนเงินส่วนลดและยอดสุทธิ');
      return;
    }
    setLoading(true);
    try {
      await postDiscountToContract(contractId, {
        discount_type: discountType,
        discount_amount: parseFloat(discountAmount),
        final_amount: parseFloat(finalAmount),
        approved_by: getAdminId(),
        note: note || undefined,
      });
      setSuccess(true);
      onSuccess();
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  };

  return ReactDOM.createPortal(
    <div style={{ position: 'fixed', zIndex: 5000, top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(30,41,59,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 8px 32px #bae6fd55', minWidth: 340, maxWidth: 420, width: '100%', padding: 28, position: 'relative' }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: 10, right: 10, background: 'transparent', border: 'none', fontSize: 22, color: '#64748b', cursor: 'pointer' }}>&times;</button>
        <div style={{ fontWeight: 700, fontSize: 20, color: '#0ea5e9', marginBottom: 18 }}>เพิ่มส่วนลด/ข้อเสนอพิเศษ</div>
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: 10 }}>
            <span style={{ fontWeight: 500, color: '#0ea5e9' }}>ประเภทส่วนลด</span>
            <select value={discountType} onChange={e => setDiscountType(e.target.value as 'early_closure' | 'custom_offer')} style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 7, border: '1.5px solid #e5e7eb' }}>
              <option value="early_closure">ปิดยอดก่อนกำหนด</option>
              <option value="custom_offer">ข้อเสนอพิเศษ</option>
            </select>
          </label>
          <label style={{ display: 'block', marginBottom: 10 }}>
            <span style={{ fontWeight: 500, color: '#0ea5e9' }}>จำนวนเงินส่วนลด <span style={{ color: 'red' }}>*</span></span>
            <input type="number" min={0} step={0.01} value={discountAmount} onChange={e => setDiscountAmount(e.target.value)} style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 7, border: '1.5px solid #e5e7eb' }} required />
          </label>
          <label style={{ display: 'block', marginBottom: 10 }}>
            <span style={{ fontWeight: 500, color: '#0ea5e9' }}>ยอดสุทธิหลังหักส่วนลด <span style={{ color: 'red' }}>*</span></span>
            <input type="number" min={0} step={0.01} value={finalAmount} onChange={e => setFinalAmount(e.target.value)} style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 7, border: '1.5px solid #e5e7eb' }} required />
          </label>
          <label style={{ display: 'block', marginBottom: 10 }}>
            <span style={{ fontWeight: 500, color: '#0ea5e9' }}>หมายเหตุ</span>
            <input type="text" value={note} onChange={e => setNote(e.target.value)} style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 7, border: '1.5px solid #e5e7eb' }} />
          </label>
          {error && <div style={{ color: '#ef4444', marginBottom: 10 }}>{error}</div>}
          {success && <div style={{ color: '#22c55e', marginBottom: 10 }}>เพิ่มส่วนลดสำเร็จ</div>}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 18 }}>
            <button type="button" onClick={onClose} style={{ background: '#f3f4f6', color: '#222', border: '1.5px solid #e5e7eb', borderRadius: 7, padding: '8px 22px', fontSize: 16, fontWeight: 500, cursor: 'pointer' }}>ยกเลิก</button>
            <button type="submit" disabled={loading} style={{ background: 'linear-gradient(90deg,#22c55e,#0ea5e9)', color: '#fff', border: 'none', borderRadius: 7, padding: '8px 22px', fontSize: 16, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px #bae6fd55', opacity: loading ? 0.7 : 1 }}>{loading ? 'กำลังบันทึก...' : 'บันทึก'}</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default DiscountModal; 