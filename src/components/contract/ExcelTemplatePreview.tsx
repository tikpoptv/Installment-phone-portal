import React, { useState } from 'react';

interface ExcelTemplatePreviewProps {
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

const ExcelTemplatePreview: React.FC<ExcelTemplatePreviewProps> = ({ contractData }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const templateData = [
    // ส่วนหัวสัญญา
    { section: 'header', field: 'A1', label: 'สัญญาเช่าซื้อสินค้า', value: 'สัญญาเช่าซื้อสินค้า', type: 'title' },
    
    // ข้อมูลสัญญา
    { section: 'contract', field: 'A3', label: 'เลขที่สัญญา', value: `CON-${Date.now()}`, type: 'data' },
    { section: 'contract', field: 'A4', label: 'วันที่ทำสัญญา', value: new Date().toLocaleDateString('th-TH'), type: 'data' },
    
    // ข้อมูลผู้ให้เช่า
    { section: 'lessor', field: 'A6', label: 'ผู้ให้เช่า', value: contractData.user_name || '_____', type: 'data' },
    
    // ข้อมูลผู้เช่า
    { section: 'lessee', field: 'A8', label: 'ผู้เช่า', value: contractData.user_name || '_____', type: 'data' },
    
    // รายละเอียดสินค้า
    { section: 'product', field: 'A10', label: 'รหัสสินค้า', value: contractData.product_id || '_____', type: 'data' },
    { section: 'product', field: 'A11', label: 'ประเภทสินค้า', value: 'โทรศัพท์มือถือ', type: 'data' },
    
    // เงื่อนไขการชำระเงิน
    { section: 'payment', field: 'A13', label: 'ราคาสินค้า', value: contractData.total_price ? `${Number(contractData.total_price).toLocaleString()} บาท` : '_____ บาท', type: 'data' },
    { section: 'payment', field: 'A14', label: 'เงินดาวน์', value: contractData.down_payment_amount ? `${Number(contractData.down_payment_amount).toLocaleString()} บาท` : '_____ บาท', type: 'data' },
    { section: 'payment', field: 'A15', label: 'จำนวนงวด', value: contractData.installment_months ? `${contractData.installment_months} งวด` : '_____ งวด', type: 'data' },
    { section: 'payment', field: 'A16', label: 'ยอดผ่อนชำระต่อเดือน', value: contractData.monthly_payment ? `${Number(contractData.monthly_payment).toLocaleString()} บาท` : '_____ บาท', type: 'data' },
    { section: 'payment', field: 'A17', label: 'วันที่เริ่ม', value: contractData.start_date || '_____', type: 'data' },
    { section: 'payment', field: 'A18', label: 'วันที่สิ้นสุด', value: contractData.end_date || '_____', type: 'data' },
    
    // ลายเซ็น
    { section: 'signature', field: 'A20', label: 'ลงนามผู้ให้เช่า', value: '_____', type: 'signature' },
    { section: 'signature', field: 'A21', label: 'ลงนามผู้เช่า', value: '_____', type: 'signature' },
    { section: 'signature', field: 'A22', label: 'พยาน', value: '_____', type: 'signature' },
  ];

  const getSectionColor = (section: string) => {
    switch (section) {
      case 'header': return '#1e40af';
      case 'contract': return '#059669';
      case 'lessor': return '#dc2626';
      case 'lessee': return '#7c3aed';
      case 'product': return '#ea580c';
      case 'payment': return '#16a34a';
      case 'terms': return '#0891b2';
      case 'signature': return '#be185d';
      default: return '#64748b';
    }
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'title': return { fontWeight: 'bold', fontSize: '16px', textAlign: 'center' as const };
      case 'subtitle': return { fontWeight: '600', fontSize: '14px', textAlign: 'center' as const, fontStyle: 'italic' };
      case 'section': return { fontWeight: 'bold', fontSize: '13px', backgroundColor: '#f1f5f9' };
      case 'signature': return { fontWeight: '600', fontStyle: 'italic' };
      default: return {};
    }
  };

  return (
    <div style={{ marginTop: '12px' }}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          color: '#fff',
          fontSize: '13px',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          borderRadius: '8px',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
        }}
      >
        <span style={{ fontSize: '14px' }}>{isExpanded ? '📄' : '👁️'}</span>
        {isExpanded ? 'ซ่อนตัวอย่างเทมเพลต' : 'ดูตัวอย่างเทมเพลตสัญญา'}
      </button>
      
      {isExpanded && (
        <div style={{
          marginTop: '12px',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          border: '2px solid #cbd5e1',
          borderRadius: '12px',
          padding: '16px',
          fontSize: '11px',
          fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ 
            fontWeight: '700', 
            marginBottom: '12px', 
            color: '#1e293b',
            fontSize: '14px',
            textAlign: 'center',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
          }}>
            📋 ตัวอย่างเทมเพลตสัญญาเช่าซื้อสินค้า
          </div>
          
          <div style={{ 
            background: '#fff', 
            border: '1px solid #e2e8f0', 
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)'
          }}>
            {templateData.map((item, index) => (
              <div key={index} style={{
                display: 'flex',
                borderBottom: index < templateData.length - 1 ? '1px solid #f1f5f9' : 'none',
                padding: '6px 10px',
                backgroundColor: item.type === 'section' ? '#f8fafc' : '#fff',
                ...getTypeStyle(item.type)
              }}>
                <div style={{
                  width: '80px',
                  fontWeight: '600',
                  color: getSectionColor(item.section),
                  fontSize: '10px',
                  borderRight: '1px solid #e2e8f0',
                  paddingRight: '8px'
                }}>
                  {item.field}
                </div>
                <div style={{
                  width: '180px',
                  fontWeight: '600',
                  color: '#374151',
                  fontSize: '11px',
                  borderRight: '1px solid #e2e8f0',
                  paddingRight: '8px'
                }}>
                  {item.label}
                </div>
                <div style={{
                  flex: 1,
                  color: item.value && item.value !== '_____' ? '#059669' : '#94a3b8',
                  fontStyle: item.value && item.value !== '_____' ? 'normal' : 'italic',
                  fontSize: '11px',
                  paddingLeft: '8px'
                }}>
                  {item.value || '(ข้อมูลจะถูกกรอกอัตโนมัติ)'}
                </div>
              </div>
            ))}
          </div>
          
          <div style={{
            marginTop: '12px',
            padding: '10px',
            background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
            borderRadius: '8px',
            border: '1px solid #93c5fd'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '11px',
              color: '#1e40af',
              fontWeight: '600'
            }}>
              <span style={{ fontSize: '14px' }}>💡</span>
              <span>ข้อมูลในไฟล์ Excel จะถูกกรอกอัตโนมัติตามข้อมูลที่ระบุในฟอร์ม</span>
            </div>
            <div style={{
              fontSize: '10px',
              color: '#475569',
              marginTop: '4px',
              marginLeft: '22px'
            }}>
              เทมเพลตนี้เป็นไปตามมาตรฐานสัญญาเช่าซื้อสินค้าที่ได้รับการรับรอง
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExcelTemplatePreview; 