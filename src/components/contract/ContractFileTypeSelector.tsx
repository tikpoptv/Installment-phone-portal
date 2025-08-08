import React from 'react';
import styles from '../../pages/admin/orders/OrderCreateModal.module.css';

interface ContractFileTypeSelectorProps {
  selectedType: 'upload' | 'auto' | 'manual';
  onTypeChange: (type: 'upload' | 'auto' | 'manual') => void;
}

const ContractFileTypeSelector: React.FC<ContractFileTypeSelectorProps> = ({ 
  selectedType, 
  onTypeChange 
}) => {
  return (
    <div>
      <label className={styles.formLabel}>
        ประเภทไฟล์สัญญา <span className={styles.required}>*</span>
      </label>
      <div style={{ 
        padding: '8px 12px', 
        background: '#fef3c7', 
        border: '1px solid #f59e0b', 
        borderRadius: '6px',
        fontSize: '12px',
        color: '#92400e',
        marginBottom: '12px'
      }}>
        <div style={{ fontWeight: '600', marginBottom: '4px' }}>⚠️ หมายเหตุ:</div>
        <div>• การเปลี่ยนหมวดหมู่จะรีเซ็ตไฟล์ของหมวดหมู่เดิม</div>
        <div>• กรุณาเลือกหมวดหมู่ที่ต้องการใช้ก่อนดำเนินการ</div>
      </div>
      <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }}>
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          cursor: 'pointer',
          padding: '8px 12px',
          border: `2px solid ${selectedType === 'upload' ? '#0ea5e9' : '#e5e7eb'}`,
          borderRadius: '8px',
          background: selectedType === 'upload' ? '#f0f9ff' : '#fff',
          color: selectedType === 'upload' ? '#0ea5e9' : '#64748b',
          fontWeight: selectedType === 'upload' ? '600' : '400',
          transition: 'all 0.2s ease'
        }}>
          <input
            type="radio"
            name="contractFileType"
            value="upload"
            checked={selectedType === 'upload'}
            onChange={(e) => onTypeChange(e.target.value as 'upload' | 'auto' | 'manual')}
            style={{ margin: 0 }}
          />
          อัปโหลดไฟล์เอง
        </label>
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          cursor: 'pointer',
          padding: '8px 12px',
          border: `2px solid ${selectedType === 'auto' ? '#0ea5e9' : '#e5e7eb'}`,
          borderRadius: '8px',
          background: selectedType === 'auto' ? '#f0f9ff' : '#fff',
          color: selectedType === 'auto' ? '#0ea5e9' : '#64748b',
          fontWeight: selectedType === 'auto' ? '600' : '400',
          transition: 'all 0.2s ease'
        }}>
          <input
            type="radio"
            name="contractFileType"
            value="auto"
            checked={selectedType === 'auto'}
            onChange={(e) => onTypeChange(e.target.value as 'upload' | 'auto' | 'manual')}
            style={{ margin: 0 }}
          />
          สร้างไฟล์อัตโนมัติ
        </label>
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          cursor: 'pointer',
          padding: '8px 12px',
          border: `2px solid ${selectedType === 'manual' ? '#0ea5e9' : '#e5e7eb'}`,
          borderRadius: '8px',
          background: selectedType === 'manual' ? '#f0f9ff' : '#fff',
          color: selectedType === 'manual' ? '#0ea5e9' : '#64748b',
          fontWeight: selectedType === 'manual' ? '600' : '400',
          transition: 'all 0.2s ease'
        }}>
          <input
            type="radio"
            name="contractFileType"
            value="manual"
            checked={selectedType === 'manual'}
            onChange={(e) => onTypeChange(e.target.value as 'upload' | 'auto' | 'manual')}
            style={{ margin: 0 }}
          />
          กรอกเลขคำสั่งซื้อเอง
        </label>
      </div>
      {selectedType === 'manual' && (
        <div style={{ 
          padding: '8px 12px', 
          background: '#f0f9ff', 
          border: '1px solid #0ea5e9', 
          borderRadius: '6px',
          fontSize: '12px',
          color: '#0c4a6e',
          marginTop: '8px'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>💡 สำหรับกรณี:</div>
          <div>• ปริ้นเอกสารแล้วเผลอปิดหน้าจอ</div>
          <div>• มีเลขคำสั่งซื้ออยู่แล้ว ต้องการอัปเดตข้อมูล</div>
          <div>• กรอกเลขคำสั่งซื้อที่ได้จากระบบแล้ว</div>
          <div style={{ marginTop: '4px', fontWeight: '600', color: '#dc2626' }}>
            ⚠️ หมายเหตุ: รองรับเฉพาะไฟล์ PDF เท่านั้น
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractFileTypeSelector; 