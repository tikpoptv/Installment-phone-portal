import React, { useState } from 'react';
import styles from '../../pages/admin/orders/OrderCreateModal.module.css';
import { toast } from 'react-toastify';

interface ContractFileUploadProps {
  file: File | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

const ContractFileUpload: React.FC<ContractFileUploadProps> = ({ 
  file, 
  onFileChange, 
  fileInputRef 
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

      // ลบ URL เก่าถ้ามี
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      // สร้าง URL ใหม่สำหรับ preview
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);

      // เรียกใช้ฟังก์ชันเดิม
      onFileChange(e);
    }
  };

  // ฟังก์ชันแสดงตัวอย่างไฟล์
  const handlePreviewClick = () => {
    if (file) {
      // ลบ URL เก่าถ้ามี
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      // สร้าง URL ใหม่ทุกครั้ง
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setShowPreview(true);
    } else {
      toast.error('ไม่มีไฟล์ให้แสดงตัวอย่าง');
    }
  };

  // ฟังก์ชันปิด modal
  const handleClosePreview = () => {
    setShowPreview(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
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
            onClick={handlePreviewClick}
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
            {file.type.startsWith('image/') ? '🖼️ ดูตัวอย่างรูปภาพ' : '📄 ดูตัวอย่างไฟล์'}
          </button>
        </div>
      )}

      {/* Modal แสดงตัวอย่างไฟล์ */}
      {showPreview && previewUrl && file && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(30,41,59,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ background: '#fff', borderRadius: 12, maxWidth: 600, width: '95vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #e5e7eb', fontWeight: 'bold', background: '#f1f5f9' }}>
              <span>แสดงตัวอย่างไฟล์สัญญาคำสั่งซื้อ</span>
              <button onClick={handleClosePreview} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#64748b', cursor: 'pointer', padding: '4px 8px' }}>&times;</button>
            </div>
            <div style={{ padding: 0, flex: 1, overflow: 'auto', background: '#f9fafb', minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {file.type.startsWith('image/') ? (
                <img
                  src={previewUrl}
                  alt="Order Contract File Preview"
                  style={{ maxWidth: '100%', maxHeight: 500, borderRadius: 8, boxShadow: '0 2px 8px #bae6fd55' }}
                />
              ) : (
                <iframe
                  src={previewUrl}
                  title="Order Contract File Preview"
                  width="100%"
                  height="500px"
                  style={{ border: 'none', display: 'block' }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractFileUpload; 