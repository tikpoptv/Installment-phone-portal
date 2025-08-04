import React from 'react';
import styles from '../../pages/admin/orders/OrderCreateModal.module.css';

interface ContractFileTypeSelectorProps {
  selectedType: 'upload' | 'auto';
  onTypeChange: (type: 'upload' | 'auto') => void;
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
      <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
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
            onChange={(e) => onTypeChange(e.target.value as 'upload' | 'auto')}
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
            onChange={(e) => onTypeChange(e.target.value as 'upload' | 'auto')}
            style={{ margin: 0 }}
          />
          สร้างไฟล์อัตโนมัติ
        </label>
      </div>
    </div>
  );
};

export default ContractFileTypeSelector; 