import React from 'react';
import styles from './IcloudDeleteConfirmModal.module.css';

interface Props {
  open: boolean;
  icloudId: string | null;
  icloudUsername: string | null;
  onClose: () => void;
  onDeleteConfirm: () => void;
}

const IcloudDeleteConfirmModal: React.FC<Props> = ({ open, icloudId, icloudUsername, onClose, onDeleteConfirm }) => {
  if (!open) return null;
  return (
    <div className={styles.overlay}>
      <div className={styles.modalBox}>
        <div className={styles.title}>ยืนยันการลบ iCloud</div>
        <div className={styles.msg}>
          คุณแน่ใจหรือไม่ว่าต้องการลบ iCloud นี้?<br />
          <span className={styles.idRow}>ID: <b>{icloudId}</b></span><br />
          <span className={styles.idRow}>ชื่อผู้ใช้: <b>{icloudUsername}</b></span><br />
          <span style={{ color: '#ef4444', fontWeight: 500 }}>หากลบแล้วจะไม่สามารถเพิ่มบัญชีนี้ซ้ำได้อีก</span><br />
          <span style={{ color: '#64748b', fontWeight: 500 }}>เราไม่แนะนำให้ลบ เว้นแต่จำเป็นจริง ๆ</span>
        </div>
        <div className={styles.btnRow}>
          <button className={styles.btnCancel} onClick={onClose}>ยกเลิก</button>
          <button className={styles.btnDelete} onClick={onDeleteConfirm}>ลบข้อมูล</button>
        </div>
      </div>
    </div>
  );
};

export default IcloudDeleteConfirmModal; 