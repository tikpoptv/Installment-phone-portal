import React from 'react';
import styles from '../../pages/admin/orders/OrderCreateModal.module.css';

interface ContractFileUploadProps {
  file: File | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPreviewClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

const ContractFileUpload: React.FC<ContractFileUploadProps> = ({ 
  file, 
  onFileChange, 
  onPreviewClick, 
  fileInputRef 
}) => {
  return (
    <div>
      <label className={styles.formLabel}>
        ไฟล์สัญญาคำสั่งซื้อ (PDF หรือ รูปภาพ) <span className={styles.required}>*</span>
      </label>
      <input
        type="file"
        accept="application/pdf,image/jpeg,image/png,image/webp"
        onChange={onFileChange}
        className={styles.inputBox}
        ref={fileInputRef}
        required
      />
      {file && (
        <div style={{ marginTop: 6, color: '#0ea5e9', fontSize: 14 }}>
          ไฟล์: {file.name}
          <button
            type="button"
            onClick={onPreviewClick}
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
          >
            ดูตัวอย่างไฟล์
          </button>
        </div>
      )}
    </div>
  );
};

export default ContractFileUpload; 