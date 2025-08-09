import React, { useState } from 'react';
import styles from '../../pages/admin/orders/OrderCreateModal.module.css';
import { toast } from 'react-toastify';

interface ManualContractInputProps {
  contractId: string;
  onContractIdChange: (contractId: string) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  file: File | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

const ManualContractInput: React.FC<ManualContractInputProps> = ({
  contractId,
  onContractIdChange,
  onFileChange,
  file,
  fileInputRef
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleContractIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // อนุญาตให้กรอกได้เฉพาะตัวเลขและตัวอักษร
    const sanitizedValue = value.replace(/[^a-zA-Z0-9-_]/g, '');
    onContractIdChange(sanitizedValue);
  };

  // ฟังก์ชันตรวจสอบไฟล์
  const validateFile = (file: File): boolean => {
    // ตรวจสอบขนาดไฟล์ (สูงสุด 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('ขนาดไฟล์ต้องไม่เกิน 10MB');
      return false;
    }

    // ตรวจสอบประเภทไฟล์ - บังคับให้เป็น PDF เท่านั้น
    if (file.type !== 'application/pdf') {
      toast.error('กรุณาเลือกไฟล์ PDF เท่านั้น');
      return false;
    }

    // ตรวจสอบนามสกุลไฟล์
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('กรุณาเลือกไฟล์ PDF เท่านั้น');
      return false;
    }

    // ตรวจสอบชื่อไฟล์
    if (file.name.length > 100) {
      toast.error('ชื่อไฟล์ต้องไม่เกิน 100 ตัวอักษร');
      return false;
    }

    return true;
  };

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

      // เรียก onFileChange ของ parent component
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
      <div style={{ 
        padding: '12px 16px', 
        background: '#f0f9ff', 
        border: '1px solid #bae6fd', 
        borderRadius: '8px',
        marginBottom: '16px'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          color: '#0ea5e9',
          fontWeight: '600',
          fontSize: '14px',
          marginBottom: '12px'
        }}>
          <span style={{ fontSize: '16px' }}>📝</span>
          กรอกเลขคำสั่งซื้อเอง
        </div>
        <div style={{ 
          fontSize: '12px', 
          color: '#64748b', 
          marginBottom: '12px',
          lineHeight: '1.5'
        }}>
          กรุณากรอกเลขคำสั่งซื้อที่ได้จากระบบ และอัปโหลดไฟล์สัญญาที่เกี่ยวข้อง
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label>เลขคำสั่งซื้อ <span className={styles.required}>*</span></label>
        <input
          type="text"
          value={contractId}
          onChange={handleContractIdChange}
          className={styles.inputBox}
          placeholder="กรอกเลขคำสั่งซื้อ..."
          style={{ 
            fontFamily: 'monospace',
            fontSize: '14px',
            letterSpacing: '0.5px'
          }}
        />
        <div style={{ 
          fontSize: '12px', 
          color: '#64748b', 
          marginTop: '4px',
          fontStyle: 'italic'
        }}>
          💡 ตัวอย่าง: CT00001, CT00002
        </div>
      </div>

      <div>
        <label>ไฟล์สัญญา <span className={styles.required}>*</span></label>
        <div style={{ 
          padding: '8px 12px', 
          background: '#f8fafc', 
          border: '1px solid #e2e8f0', 
          borderRadius: '6px',
          fontSize: '12px',
          color: '#64748b',
          marginBottom: '8px'
        }}>
          <div>📋 รองรับไฟล์: PDF เท่านั้น</div>
          <div>📏 ขนาดสูงสุด: 10MB</div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          accept="application/pdf"
          className={styles.inputBox}
          style={{ 
            padding: '8px 12px',
            border: '2px dashed #d1d5db',
            borderRadius: '8px',
            background: '#f9fafb',
            cursor: 'pointer'
          }}
        />
        {file && (
          <div style={{ 
            marginTop: '8px',
            padding: '8px 12px',
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#0c4a6e'
          }}>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>📎 ไฟล์ที่เลือก:</div>
            <div>{file.name}</div>
            <div style={{ color: '#64748b', marginTop: '2px' }}>
              ขนาด: {(file.size / 1024 / 1024).toFixed(2)} MB
            </div>
            <button
              type="button"
              onClick={handlePreviewClick}
              style={{
                marginTop: '8px',
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
              📄 ดูตัวอย่างไฟล์ PDF
            </button>
          </div>
        )}
        <div style={{ 
          fontSize: '12px', 
          color: '#64748b', 
          marginTop: '4px',
          fontStyle: 'italic'
        }}>
          💡 รองรับเฉพาะไฟล์ PDF เท่านั้น (สูงสุด 10MB)
        </div>
      </div>

      {contractId && (
        <div style={{ 
          marginTop: '12px',
          padding: '8px 12px',
          background: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#92400e'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>⚠️ หมายเหตุ:</div>
          <div>• เลขคำสั่งซื้อ: <strong>{contractId}</strong></div>
          <div>• ระบบจะใช้ PUT request เพื่ออัปเดตข้อมูล</div>
          <div>• ตรวจสอบให้แน่ใจว่าเลขคำสั่งซื้อถูกต้อง</div>
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
              <iframe
                src={previewUrl}
                title="Order Contract File Preview"
                width="100%"
                height="500px"
                style={{ border: 'none', display: 'block' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManualContractInput; 