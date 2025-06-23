import React from 'react';
import type { Installment } from '../Dashboard';
import styles from '../Dashboard.module.css';

interface PaymentSlipModalProps {
  open: boolean;
  order: Installment | null;
  onClose: () => void;
}

const PaymentSlipModal: React.FC<PaymentSlipModalProps> = ({ open, order, onClose }) => {
  if (!open || !order) return null;
  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0ea5e9', marginBottom: 8 }}>
          แจ้งชำระเงินสำหรับ <span style={{ color: '#0369a1' }}>{order.product}</span>
        </h3>
        <div style={{ color: '#64748b', fontSize: 15, marginBottom: 8 }}>งวดที่: <b>{order.period}</b></div>
        <div style={{ color: '#0ea5e9', fontWeight: 600, fontSize: 17, marginBottom: 16 }}>
          ยอดชำระ: <span style={{ color: '#ef4444', fontWeight: 700 }}>{order.amount.toLocaleString()} บาท</span>
        </div>
        <div style={{ margin: '16px 0' }}>
          <input type="file" accept="image/*" style={{ display: 'block', margin: '0 auto 12px auto' }} />
        </div>
        <div style={{ marginTop: 12 }}>
          <button className={styles.modalButton} style={{ marginRight: 8 }} onClick={onClose}>ยกเลิก</button>
          <button className={styles.modalButton}>
            ส่งสลิป
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSlipModal; 