import React, { useState } from 'react';
import styles from './IcloudLockModal.module.css';
import type { IcloudCredential } from '../../../services/icloud.service';

interface Props {
  open: boolean;
  productImei: string;
  icloudList: IcloudCredential[];
  onClose: () => void;
  onConfirm: (icloudId: string) => void;
  onCreate: () => void;
}

const IcloudLockModal: React.FC<Props> = ({ open, productImei, icloudList, onClose, onConfirm, onCreate }) => {
  const [selected, setSelected] = useState<string>('');
  if (!open) return null;
  return (
    <div className={styles.overlay}>
      <div className={styles.modalBox}>
        <div className={styles.title}>เชื่อมโยงกับบัญชี iCloud</div>
        <div className={styles.msg}>
          กรุณาเลือกบัญชี iCloud ที่ต้องการเชื่อมโยงกับสินค้านี้ (IMEI: <b>{productImei}</b>)
        </div>
        {icloudList.length === 0 ? (
          <div className={styles.emptyMsg}>ไม่พบบัญชี iCloud ในระบบ</div>
        ) : (
          <select
            className={styles.select}
            value={selected}
            onChange={e => setSelected(e.target.value)}
            style={{ width: '100%', marginBottom: 20 }}
          >
            <option value="">-- เลือกบัญชี iCloud --</option>
            {icloudList.map(i => (
              <option key={i.id} value={i.id}>
                ID: {i.id} | ผู้ใช้: {i.icloud_username}
              </option>
            ))}
          </select>
        )}
        <button className={styles.createBtn} onClick={onCreate} type="button">สร้าง iCloud ใหม่</button>
        <div className={styles.btnRow}>
          <button className={styles.btnCancel} onClick={onClose}>ยกเลิก</button>
          <button
            className={styles.btnConfirm}
            onClick={() => selected && onConfirm(selected)}
            disabled={!selected}
          >ยืนยัน</button>
        </div>
      </div>
    </div>
  );
};

export default IcloudLockModal; 