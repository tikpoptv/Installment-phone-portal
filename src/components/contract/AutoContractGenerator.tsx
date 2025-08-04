import React, { useState } from 'react';
import styles from '../../pages/admin/orders/OrderCreateModal.module.css';
import { generateContractPdf, displayContractPdf, type ContractPdfData } from '../../services/contract-excel.service';
import { toast } from 'react-toastify';
import ExcelTemplatePreview from './ExcelTemplatePreview';
import SignatureModal from './SignatureModal';

interface AutoContractGeneratorProps {
  contractData: {
    user_id: string;
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [signatureModal, setSignatureModal] = useState<null | 'user' | 'renter' | 'witness'>(null);
  const [userSignature, setUserSignature] = useState<string | null>(null);
  const [renterSignature, setRenterSignature] = useState<string | null>(null);
  const [witnessSignature, setWitnessSignature] = useState<string | null>(null);
  const [pdfGenerated, setPdfGenerated] = useState(false);

  const isAllSigned = Boolean(userSignature && renterSignature && witnessSignature);

  const handleGeneratePdf = async () => {
    if (isGenerating || !isAllSigned) return;
    
    setIsGenerating(true);
    try {
      // เตรียมข้อมูลสำหรับสร้าง PDF
      const pdfData: ContractPdfData = {
        user_id: contractData.user_id,
        product_id: contractData.product_id,
        total_price: Number(contractData.total_price),
        total_with_interest: Number(contractData.total_with_interest),
        installment_months: Number(contractData.installment_months),
        monthly_payment: Number(contractData.monthly_payment),
        start_date: contractData.start_date,
        end_date: contractData.end_date,
        down_payment_amount: Number(contractData.down_payment_amount),
        rental_cost: Number(contractData.rental_cost),
        contract_number: `CON-${Date.now()}`,
        created_date: new Date().toISOString().slice(0, 10),
        user_signature: userSignature!,
        renter_signature: renterSignature!,
        witness_signature: witnessSignature!,
      };

      // สร้างไฟล์ PDF
      const blob = await generateContractPdf(pdfData);
      
      // แสดง PDF ในหน้าเว็บ
      displayContractPdf(blob, 'pdf-container');
      setPdfGenerated(true);
      
      toast.success('สร้างไฟล์ PDF สำเร็จ!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('เกิดข้อผิดพลาดในการสร้างไฟล์ PDF');
    } finally {
      setIsGenerating(false);
    }
  };

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
          <span>ระบบจะสร้างไฟล์สัญญาเช่าซื้อสินค้าให้อัตโนมัติ</span>
        </div>
        <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.4', marginBottom: '12px' }}>
          ไฟล์จะถูกสร้างจากข้อมูลที่กรอกข้างต้น และสามารถดูได้ในหน้าเว็บหลังจากบันทึกสำเร็จ
        </div>
        
        {/* แสดงข้อมูลที่จะใช้สร้างสัญญา */}
        <div style={{ 
          background: '#fff', 
          border: '1px solid #e5e7eb', 
          borderRadius: '6px', 
          padding: '12px',
          fontSize: '12px',
          color: '#374151',
          marginBottom: '16px'
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
        
        {/* แสดงตัวอย่างเทมเพลต Excel */}
        <ExcelTemplatePreview contractData={contractData} />
        
        {/* ปุ่มเซ็นลายเซ็น */}
        <div style={{ display: 'flex', gap: 16, margin: '24px 0 0 0', flexWrap: 'wrap' }}>
          <button type="button" onClick={() => setSignatureModal('user')} style={{
            background: userSignature ? '#16a34a' : '#f1f5f9',
            color: userSignature ? '#fff' : '#334155',
            border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
          }}>
            {userSignature ? '✔️' : '❌'} ลายเซ็นผู้ให้เช่า
          </button>
          <button type="button" onClick={() => setSignatureModal('renter')} style={{
            background: renterSignature ? '#16a34a' : '#f1f5f9',
            color: renterSignature ? '#fff' : '#334155',
            border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
          }}>
            {renterSignature ? '✔️' : '❌'} ลายเซ็นผู้เช่า
          </button>
          <button type="button" onClick={() => setSignatureModal('witness')} style={{
            background: witnessSignature ? '#16a34a' : '#f1f5f9',
            color: witnessSignature ? '#fff' : '#334155',
            border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
          }}>
            {witnessSignature ? '✔️' : '❌'} ลายเซ็นพยาน
          </button>
        </div>
        
        {/* Modal สำหรับเซ็น */}
        <SignatureModal
          open={signatureModal === 'user'}
          onClose={() => setSignatureModal(null)}
          onSave={sig => { setUserSignature(sig); setSignatureModal(null); }}
          title="เซ็นลายเซ็นผู้ให้เช่า"
        />
        <SignatureModal
          open={signatureModal === 'renter'}
          onClose={() => setSignatureModal(null)}
          onSave={sig => { setRenterSignature(sig); setSignatureModal(null); }}
          title="เซ็นลายเซ็นผู้เช่า"
        />
        <SignatureModal
          open={signatureModal === 'witness'}
          onClose={() => setSignatureModal(null)}
          onSave={sig => { setWitnessSignature(sig); setSignatureModal(null); }}
          title="เซ็นลายเซ็นพยาน"
        />
        
        {/* ปุ่มสร้างไฟล์ PDF (ล่างสุด) */}
        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <button
            type="button"
            onClick={handleGeneratePdf}
            disabled={!isAllSigned || isGenerating}
            style={{
              background: isAllSigned && !isGenerating ? 'linear-gradient(90deg, #0ea5e9 0%, #38bdf8 100%)' : '#e5e7eb',
              color: isAllSigned && !isGenerating ? '#fff' : '#64748b',
              border: 'none',
              borderRadius: '8px',
              padding: '14px 32px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: isAllSigned && !isGenerating ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
              boxShadow: isAllSigned && !isGenerating ? '0 2px 8px #bae6fd' : 'none',
              opacity: isGenerating ? 0.7 : 1,
              marginTop: 12
            }}
          >
            {isGenerating ? (
              <><span style={{ fontSize: '18px' }}>⏳</span> กำลังสร้างไฟล์...</>
            ) : (
              <><span style={{ fontSize: '18px' }}>📄</span> สร้างไฟล์ PDF</>
            )}
          </button>
        </div>
      </div>
      
      {/* ห้องแสดง PDF */}
      {pdfGenerated && (
        <div style={{ marginTop: '24px' }}>
          <div style={{ 
            background: '#fff', 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px', 
            padding: '16px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ 
              fontWeight: '600', 
              marginBottom: '12px', 
              color: '#0ea5e9',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '18px' }}>📄</span>
              ไฟล์สัญญาเช่าซื้อสินค้า
            </div>
            <div id="pdf-container" style={{ minHeight: '600px' }}>
              {/* PDF จะถูกแสดงที่นี่ */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoContractGenerator; 