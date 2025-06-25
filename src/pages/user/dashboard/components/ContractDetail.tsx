import React from 'react';

export interface ContractDetailProps {
  contract: {
    id: string;
    product_name?: string;
    total_price: number;
    total_with_interest: number;
    installment_months: number;
    monthly_payment: number;
    status: 'active' | 'closed' | 'default' | 'repossessed' | 'returned';
    start_date?: string;
    end_date?: string;
    last_payment_date?: string;
    pdpa_consent_file_url?: string;
    created_at?: string;
  };
  onBack?: () => void;
}

const statusMap: Record<string, { label: string; color: string }> = {
  active: { label: 'ใช้งานอยู่', color: '#22c55e' },
  closed: { label: 'ปิดสัญญา', color: '#64748b' },
  default: { label: 'ผิดนัด', color: '#ef4444' },
  repossessed: { label: 'ยึดคืน', color: '#f59e42' },
  returned: { label: 'คืนสินค้า', color: '#fbbf24' },
};

const ContractDetail: React.FC<ContractDetailProps> = ({ contract, onBack }) => {
  const status = statusMap[contract.status] || { label: contract.status, color: '#64748b' };
  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      boxShadow: '0 2px 12px rgba(14,165,233,0.10)',
      maxWidth: 420,
      margin: '0 auto',
      padding: '28px 18px 18px 18px',
      fontSize: '1.04em',
      color: '#22223b',
      marginTop: 18,
    }}>
      <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18}}>
        <span style={{fontSize: 28, color: '#0ea5e9'}}>📄</span>
        <span style={{fontWeight: 700, fontSize: '1.18em', color: '#0ea5e9'}}>รายละเอียดสัญญา</span>
      </div>
      <div style={{marginBottom: 8}}><b>รหัสสัญญา:</b> {contract.id}</div>
      <div style={{marginBottom: 8}}><b>สินค้า:</b> {contract.product_name || '-'}</div>
      <div style={{marginBottom: 8}}><b>ราคารวม:</b> {contract.total_price.toLocaleString()} บาท</div>
      <div style={{marginBottom: 8}}><b>ราคารวมดอกเบี้ย:</b> {contract.total_with_interest.toLocaleString()} บาท</div>
      <div style={{marginBottom: 8}}><b>จำนวนงวด:</b> {contract.installment_months} งวด</div>
      <div style={{marginBottom: 8}}><b>ค่างวด/เดือน:</b> {contract.monthly_payment.toLocaleString()} บาท</div>
      <div style={{marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8}}>
        <b>สถานะ:</b>
        <span style={{display: 'inline-flex', alignItems: 'center', gap: 4}}>
          <span style={{display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: status.color}}></span>
          <span style={{color: status.color, fontWeight: 600}}>{status.label}</span>
        </span>
      </div>
      <div style={{marginBottom: 8}}><b>วันที่เริ่ม:</b> {contract.start_date || '-'}</div>
      <div style={{marginBottom: 8}}><b>วันที่สิ้นสุด:</b> {contract.end_date || '-'}</div>
      <div style={{marginBottom: 8}}><b>ชำระล่าสุด:</b> {contract.last_payment_date || '-'}</div>
      <div style={{marginBottom: 8}}>
        <b>ไฟล์ PDPA:</b> {contract.pdpa_consent_file_url ? (
          <a href={contract.pdpa_consent_file_url} target="_blank" rel="noopener noreferrer" style={{color: '#0ea5e9', textDecoration: 'underline'}}>ดู/ดาวน์โหลด</a>
        ) : '-'}
      </div>
      <div style={{marginBottom: 8}}><b>วันที่สร้าง:</b> {contract.created_at ? new Date(contract.created_at).toLocaleString('th-TH') : '-'}</div>
      {onBack && (
        <button
          style={{
            marginTop: 18,
            background: 'linear-gradient(90deg, #0ea5e9 0%, #38bdf8 100%)',
            color: '#fff',
            fontWeight: 600,
            border: 'none',
            borderRadius: 18,
            padding: '10px 0',
            fontSize: '1em',
            width: '100%',
            cursor: 'pointer',
            boxShadow: '0 1px 4px rgba(14,165,233,0.08)'
          }}
          onClick={onBack}
        >ย้อนกลับ</button>
      )}
    </div>
  );
};

export default ContractDetail; 