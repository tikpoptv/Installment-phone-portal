import React from 'react';
import styles from '../../pages/admin/orders/OrderCreateModal.module.css';

interface AutoContractGeneratorProps {
  contractData: {
    user_name: string;
    product_id: string;
    total_price: string;
    total_with_interest: string;
    installment_months: string;
    monthly_payment: string;
    start_date: string;
    end_date: string;
    down_payment_amount: string;
    rental_cost: string;
  };
}

const AutoContractGenerator: React.FC<AutoContractGeneratorProps> = ({ contractData }) => {
  return (
    <div>
      <label className={styles.formLabel}>สร้างไฟล์สัญญาอัตโนมัติ</label>
      <div style={{ 
        padding: '12px 16px', 
        background: '#f0f9ff', 
        border: '1px solid #bae6fd', 
        borderRadius: '8px',
        color: '#0ea5e9',
        fontSize: '14px',
        fontWeight: '500'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '16px' }}>📄</span>
          <span>ระบบจะสร้างไฟล์สัญญาคำสั่งซื้อให้อัตโนมัติ</span>
        </div>
        <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.4', marginBottom: '12px' }}>
          ไฟล์จะถูกสร้างจากข้อมูลที่กรอกข้างต้น และสามารถดาวน์โหลดได้หลังจากบันทึกสำเร็จ
        </div>
        
        {/* แสดงข้อมูลที่จะใช้สร้างสัญญา */}
        <div style={{ 
          background: '#fff', 
          border: '1px solid #e5e7eb', 
          borderRadius: '6px', 
          padding: '12px',
          fontSize: '12px',
          color: '#374151'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '8px', color: '#0ea5e9' }}>
            📋 ข้อมูลที่จะใช้สร้างสัญญา:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <strong>ลูกค้า:</strong> {contractData.user_name || 'ไม่ระบุ'}
            </div>
            <div>
              <strong>รหัสสินค้า:</strong> {contractData.product_id || 'ไม่ระบุ'}
            </div>
            <div>
              <strong>ราคาสินค้า:</strong> {contractData.total_price ? `${Number(contractData.total_price).toLocaleString()} บาท` : 'ไม่ระบุ'}
            </div>
            <div>
              <strong>ราคารวมดอกเบี้ย:</strong> {contractData.total_with_interest ? `${Number(contractData.total_with_interest).toLocaleString()} บาท` : 'ไม่ระบุ'}
            </div>
            <div>
              <strong>เงินดาวน์:</strong> {contractData.down_payment_amount ? `${Number(contractData.down_payment_amount).toLocaleString()} บาท` : 'ไม่ระบุ'}
            </div>
            <div>
              <strong>ค่าเช่า/ผ่อน:</strong> {contractData.rental_cost ? `${Number(contractData.rental_cost).toLocaleString()} บาท` : 'ไม่ระบุ'}
            </div>
            <div>
              <strong>จำนวนงวด:</strong> {contractData.installment_months || 'ไม่ระบุ'} งวด
            </div>
            <div>
              <strong>ยอดผ่อนต่อเดือน:</strong> {contractData.monthly_payment ? `${Number(contractData.monthly_payment).toLocaleString()} บาท` : 'ไม่ระบุ'}
            </div>
            <div>
              <strong>วันที่เริ่ม:</strong> {contractData.start_date || 'ไม่ระบุ'}
            </div>
            <div>
              <strong>วันที่สิ้นสุด:</strong> {contractData.end_date || 'ไม่ระบุ'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoContractGenerator; 