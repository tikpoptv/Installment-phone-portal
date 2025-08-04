import React from 'react';
import styles from '../../pages/admin/orders/OrderCreateModal.module.css';
import { toast } from 'react-toastify';

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
  // ฟังก์ชันตรวจสอบไฟล์
  const validateFile = (file: File): boolean => {
    // ตรวจสอบขนาดไฟล์ (สูงสุด 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('ขนาดไฟล์ต้องไม่เกิน 10MB');
      return false;
    }

    // ตรวจสอบประเภทไฟล์
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast.error('รองรับเฉพาะไฟล์ PDF, JPEG, PNG และ WebP เท่านั้น');
      return false;
    }

    // ตรวจสอบชื่อไฟล์
    if (file.name.length > 100) {
      toast.error('ชื่อไฟล์ต้องไม่เกิน 100 ตัวอักษร');
      return false;
    }

    return true;
  };

  // ฟังก์ชันจัดการการเปลี่ยนแปลงไฟล์
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // ตรวจสอบไฟล์
      if (!validateFile(selectedFile)) {
        // รีเซ็ต input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      // เรียกใช้ฟังก์ชันเดิม
      onFileChange(e);
      toast.success(`อัปโหลดไฟล์ "${selectedFile.name}" สำเร็จ`);
    }
  };

  return (
    <div>
      <label className={styles.formLabel}>
        ไฟล์สัญญาคำสั่งซื้อ (PDF หรือ รูปภาพ) <span className={styles.required}>*</span>
      </label>
      <div style={{ 
        padding: '8px 12px', 
        background: '#f8fafc', 
        border: '1px solid #e2e8f0', 
        borderRadius: '6px',
        fontSize: '12px',
        color: '#64748b',
        marginBottom: '8px'
      }}>
        <div>📋 รองรับไฟล์: PDF, JPEG, PNG, WebP</div>
        <div>📏 ขนาดสูงสุด: 10MB</div>
      </div>
      <input
        type="file"
        accept="application/pdf,image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileChange}
        className={styles.inputBox}
        ref={fileInputRef}
        required
      />
      {file && (
        <div style={{ marginTop: 6, color: '#0ea5e9', fontSize: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📄 ไฟล์: {file.name}</span>
            <span style={{ color: '#64748b', fontSize: '12px' }}>
              ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </span>
          </div>
          <button
            type="button"
            onClick={onPreviewClick}
            style={{
              marginTop: '4px',
              background: '#0ea5e9',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '4px 12px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 4px #bae6fd',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            👁️ ดูตัวอย่างไฟล์
          </button>
        </div>
      )}
    </div>
  );
};

export default ContractFileUpload; 