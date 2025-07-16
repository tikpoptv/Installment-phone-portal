import React from 'react';
import styles from './BankDeleteConfirmModal.module.css';
import type { StoreBankAccountResponse } from '../../../services/store-bank-account.service';

interface Props {
  open: boolean;
  bank: StoreBankAccountResponse | null;
  onClose: () => void;
  onDeleteConfirm: () => void;
}

const BankDeleteConfirmModal: React.FC<Props> = ({ open, bank, onClose, onDeleteConfirm }) => {
  if (!open || !bank) return null;
  return (
    <div className={styles.overlay}>
      <div className={styles.modalBox}>
        <div className={styles.title}>ยืนยันการลบบัญชีธนาคาร</div>
        <div className={styles.msg}>
          คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีธนาคารนี้?<br />
          <span className={styles.idRow}>ชื่อบัญชี: <b>{bank.account_name}</b></span><br />
          <span className={styles.idRow}>เลขบัญชี: <b>{bank.account_number}</b></span><br />
          {bank.promptpay_id && <span className={styles.idRow}>พร้อมเพย์: <b>{bank.promptpay_id}</b></span>}<br />
          <span style={{ color: '#ef4444', fontWeight: 500 }}>หากลบแล้วจะไม่สามารถย้อนกลับได้</span>
        </div>
        <div className={styles.btnRow}>
          <button className={styles.btnCancel} onClick={onClose}>ยกเลิก</button>
          <button className={styles.btnDelete} onClick={onDeleteConfirm}>ลบข้อมูล</button>
        </div>
      </div>
    </div>
  );
};

export default BankDeleteConfirmModal; 