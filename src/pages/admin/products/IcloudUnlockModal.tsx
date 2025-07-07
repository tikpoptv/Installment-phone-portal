import React from 'react';
import styles from './IcloudUnlockModal.module.css';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const IcloudUnlockModal: React.FC<Props> = ({ open, onClose, onConfirm }) => {
  if (!open) return null;
  return (
    <div className={styles.overlay}>
      <div className={styles.modalBox}>
        <div className={styles.title}>ยืนยันการปลดล็อก iCloud</div>
        <div className={styles.msg}>
          คุณต้องการปลดล็อก iCloud สำหรับสินค้านี้หรือไม่?
        </div>
        <div className={styles.btnRow}>
          <button className={styles.btnCancel} onClick={onClose}>ยกเลิก</button>
          <button className={styles.btnConfirm} onClick={onConfirm}>ยืนยัน</button>
        </div>
      </div>
    </div>
  );
};

export default IcloudUnlockModal; 