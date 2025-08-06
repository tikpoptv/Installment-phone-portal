import React, { useState, useEffect } from 'react';
import styles from '../../pages/admin/orders/OrderCreateModal.module.css';
import { generateContractPdf, displayContractPdf, type ContractPdfData } from '../../services/contract-excel.service';
import { toast } from 'react-toastify';
import SignatureModal from './SignatureModal';
import { createMinimalContract } from '../../services/contract.service'; // Added import for createMinimalContract

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
  onPdfGenerated?: (blob: Blob, contractId?: string) => void;
  existingContractId?: string | null;
}

const AutoContractGenerator: React.FC<AutoContractGeneratorProps> = ({ 
  contractData, 
  onPdfGenerated,
  existingContractId = null
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [signatureModal, setSignatureModal] = useState<null | 'user' | 'renter' | 'witness'>(null);
  const [userSignature, setUserSignature] = useState<string | null>(null);
  const [renterSignature, setRenterSignature] = useState<string | null>(null);
  const [witnessSignature, setWitnessSignature] = useState<string | null>(null);
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [showSignatureWarningModal, setShowSignatureWarningModal] = useState(false);
  const [pendingGenerateAction, setPendingGenerateAction] = useState<(() => void) | null>(null);

  // แสดง PDF เมื่อมี blob และ DOM พร้อม
  useEffect(() => {
    if (pdfBlob && pdfGenerated) {
      // รอให้ DOM render ก่อน
      setTimeout(() => {
        displayContractPdf(pdfBlob, 'pdf-container');
      }, 100);
    }
  }, [pdfBlob, pdfGenerated]);

  const handleClearSignature = (type: 'user' | 'renter' | 'witness') => {
    switch (type) {
      case 'user':
        setUserSignature(null);
        break;
      case 'renter':
        setRenterSignature(null);
        break;
      case 'witness':
        setWitnessSignature(null);
        break;
    }
  };

  const handleGeneratePdf = async () => {
    if (isGenerating) return;
    
    // ตรวจสอบข้อมูลที่จำเป็นก่อนสร้าง PDF
    const requiredFields = [
      { field: contractData.user_id, name: 'รหัสลูกค้า' },
      { field: contractData.product_id, name: 'รหัสสินค้า' },
      { field: contractData.total_price, name: 'ราคาสินค้า' },
      { field: contractData.total_with_interest, name: 'ราคารวมดอกเบี้ย' },
      { field: contractData.installment_months, name: 'จำนวนงวด' },
      { field: contractData.monthly_payment, name: 'ยอดผ่อนต่อเดือน' },
      { field: contractData.start_date, name: 'วันที่เริ่ม' },
      { field: contractData.end_date, name: 'วันที่สิ้นสุด' }
    ];

    const missingFields = requiredFields.filter(item => !item.field);
    if (missingFields.length > 0) {
      toast.error(`กรุณากรอกข้อมูลให้ครบถ้วน: ${missingFields.map(f => f.name).join(', ')}`);
      return;
    }

    // ตรวจสอบค่าตัวเลข
    const numericFields = [
      { field: contractData.total_price, name: 'ราคาสินค้า' },
      { field: contractData.total_with_interest, name: 'ราคารวมดอกเบี้ย' },
      { field: contractData.installment_months, name: 'จำนวนงวด' },
      { field: contractData.monthly_payment, name: 'ยอดผ่อนต่อเดือน' }
    ];

    for (const item of numericFields) {
      if (isNaN(Number(item.field)) || Number(item.field) <= 0) {
        toast.error(`${item.name} ต้องเป็นตัวเลขที่มากกว่า 0`);
        return;
      }
    }

    // ตรวจสอบวันที่
    const startDate = new Date(contractData.start_date);
    const endDate = new Date(contractData.end_date);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      toast.error('รูปแบบวันที่ไม่ถูกต้อง');
      return;
    }
    if (startDate >= endDate) {
      toast.error('วันที่เริ่มต้องน้อยกว่าวันที่สิ้นสุด');
      return;
    }

    // ตรวจสอบลายเซ็น (ไม่บังคับ แต่แนะนำ)
    const missingSignatures = [];
    if (!userSignature) missingSignatures.push('ลายเซ็นผู้ให้เช่า');
    if (!renterSignature) missingSignatures.push('ลายเซ็นผู้เช่า');
    if (!witnessSignature) missingSignatures.push('ลายเซ็นพยาน');

    if (missingSignatures.length > 0) {
      // แสดง modal แทน window.confirm
      setPendingGenerateAction(() => () => generatePdfInternal());
      setShowSignatureWarningModal(true);
      return;
    }
    
    // ถ้ามีลายเซ็นครบแล้ว ให้สร้าง PDF เลย
    generatePdfInternal();
  };

  // ฟังก์ชันสร้าง PDF จริง
  const generatePdfInternal = async () => {
    setIsGenerating(true);
    try {
      // ใช้เลขคำสั่งซื้อเดิมถ้ามี หรือขอใหม่ถ้าไม่มี
      let contractNumber = '';
      
      if (existingContractId) {
        // ใช้เลขเดิม
        contractNumber = existingContractId;
        console.log('ใช้เลขคำสั่งซื้อเดิม:', contractNumber);
      } else {
        // ขอเลขคำสั่งซื้อใหม่จาก API
        try {
          const minimalContractResponse = await createMinimalContract(
            contractData.user_id,
            contractData.product_id
          );
          
          if (minimalContractResponse.data && typeof minimalContractResponse.data === 'object' && 'id' in minimalContractResponse.data) {
            contractNumber = (minimalContractResponse.data as { id: string }).id;
          } else {
            throw new Error('ไม่ได้รับเลขคำสั่งซื้อจากระบบ');
          }
        } catch (error) {
          console.error('Error creating minimal contract:', error);
          toast.error('ไม่สามารถขอเลขคำสั่งซื้อได้ กรุณาลองใหม่อีกครั้ง');
          setIsGenerating(false);
          return;
        }
      }

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
        down_payment_amount: Number(contractData.down_payment_amount) || 0,
        rental_cost: Number(contractData.rental_cost) || 0,
        contract_number: contractNumber, // ใช้เลขคำสั่งซื้อ (เดิมหรือใหม่)
        created_date: new Date().toISOString().slice(0, 10),
        user_signature: userSignature || '',
        renter_signature: renterSignature || '',
        witness_signature: witnessSignature || '',
      };

      // สร้างไฟล์ PDF
      const blob = await generateContractPdf(pdfData);
      
      // ตรวจสอบว่า blob ถูกต้องหรือไม่
      if (!blob || blob.size === 0) {
        throw new Error('ไม่สามารถสร้างไฟล์ PDF ได้');
      }
      
      // เก็บ blob และตั้งค่า state
      setPdfBlob(blob);
      setPdfGenerated(true);
      
      // ส่ง PDF blob กลับไปให้ parent component (สำคัญ!)
      if (onPdfGenerated) {
        onPdfGenerated(blob, contractNumber);
      }
      
      const message = existingContractId 
        ? `สร้างไฟล์ PDF สำเร็จ! (ใช้เลขเดิม: ${contractNumber})`
        : `สร้างไฟล์ PDF สำเร็จ! เลขคำสั่งซื้อ: ${contractNumber}`;
      toast.success(message);
    } catch (error) {
      console.error('Error generating PDF:', error);
      let errorMessage = 'เกิดข้อผิดพลาดในการสร้างไฟล์ PDF';
      
      // จัดการ error ที่เฉพาะเจาะจง
      if (error instanceof Error) {
        if (error.message.includes('network')) {
          errorMessage = 'เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย';
        } else if (error.message.includes('template')) {
          errorMessage = 'ไม่พบเทมเพลตไฟล์ PDF';
        } else if (error.message.includes('data')) {
          errorMessage = 'ข้อมูลไม่ถูกต้องสำหรับสร้าง PDF';
        }
      }
      
      toast.error(errorMessage);
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
        
        {/* ปุ่มเซ็นลายเซ็น */}
        <div style={{ display: 'flex', gap: 16, margin: '24px 0 0 0', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button type="button" onClick={() => setSignatureModal('user')} style={{
              background: userSignature ? '#16a34a' : '#f1f5f9',
              color: userSignature ? '#fff' : '#334155',
              border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
            }}>
              {userSignature ? '✔️' : '❌'} ลายเซ็นผู้ให้เช่า
            </button>
            {userSignature && (
              <button 
                type="button" 
                onClick={() => handleClearSignature('user')}
                style={{
                  background: '#ffffff',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  padding: '8px 12px',
                  fontSize: 12,
                  cursor: 'pointer',
                  fontWeight: 600
                }}
                title="ลบลายเซ็น"
              >
                🗑️
              </button>
            )}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button type="button" onClick={() => setSignatureModal('renter')} style={{
              background: renterSignature ? '#16a34a' : '#f1f5f9',
              color: renterSignature ? '#fff' : '#334155',
              border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
            }}>
              {renterSignature ? '✔️' : '❌'} ลายเซ็นผู้เช่า
            </button>
            {renterSignature && (
              <button 
                type="button" 
                onClick={() => handleClearSignature('renter')}
                style={{
                  background: '#ffffff',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  padding: '8px 12px',
                  fontSize: 12,
                  cursor: 'pointer',
                  fontWeight: 600
                }}
                title="ลบลายเซ็น"
              >
                🗑️
              </button>
            )}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button type="button" onClick={() => setSignatureModal('witness')} style={{
              background: witnessSignature ? '#16a34a' : '#f1f5f9',
              color: witnessSignature ? '#fff' : '#334155',
              border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
            }}>
              {witnessSignature ? '✔️' : '❌'} ลายเซ็นพยาน
            </button>
            {witnessSignature && (
              <button 
                type="button" 
                onClick={() => handleClearSignature('witness')}
                style={{
                  background: '#ffffff',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  padding: '8px 12px',
                  fontSize: 12,
                  cursor: 'pointer',
                  fontWeight: 600
                }}
                title="ลบลายเซ็น"
              >
                🗑️
              </button>
            )}
          </div>
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

        {/* Modal แจ้งเตือนลายเซ็น */}
        {showSignatureWarningModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(30,41,59,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{ 
              background: '#fff', 
              borderRadius: 12, 
              maxWidth: 500, 
              width: '90vw', 
              padding: '24px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ fontSize: 48, marginBottom: '16px' }}>⚠️</div>
                <h3 style={{ 
                  fontSize: '20px', 
                  fontWeight: '600', 
                  color: '#1f2937', 
                  marginBottom: '12px' 
                }}>
                  ยังไม่มีลายเซ็น
                </h3>
                <p style={{ 
                  fontSize: '16px', 
                  color: '#6b7280', 
                  lineHeight: '1.5',
                  marginBottom: '16px'
                }}>
                  ยังไม่มีลายเซ็น: <strong>ลายเซ็นผู้ให้เช่า, ลายเซ็นผู้เช่า, ลายเซ็นพยาน</strong>
                </p>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#9ca3af', 
                  fontStyle: 'italic'
                }}>
                  ต้องการสร้างไฟล์ PDF โดยไม่มีลายเซ็นหรือไม่?
                </p>
              </div>
              
              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                justifyContent: 'center'
              }}>
                <button
                  onClick={() => {
                    setShowSignatureWarningModal(false);
                    setPendingGenerateAction(null);
                  }}
                  style={{
                    background: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: 8,
                    padding: '12px 24px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  ยกเลิก
                </button>
                <button
                  onClick={() => {
                    setShowSignatureWarningModal(false);
                    if (pendingGenerateAction) {
                      pendingGenerateAction();
                      setPendingGenerateAction(null);
                    }
                  }}
                  style={{
                    background: 'linear-gradient(90deg, #0ea5e9 0%, #38bdf8 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '12px 24px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px #bae6fd'
                  }}
                >
                  สร้างไฟล์ PDF
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* ปุ่มสร้างไฟล์ PDF (ล่างสุด) */}
        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <button
            type="button"
            onClick={handleGeneratePdf}
            disabled={isGenerating}
            style={{
              background: !isGenerating ? 'linear-gradient(90deg, #0ea5e9 0%, #38bdf8 100%)' : '#e5e7eb',
              color: !isGenerating ? '#fff' : '#64748b',
              border: 'none',
              borderRadius: '8px',
              padding: '14px 32px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: !isGenerating ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
              boxShadow: !isGenerating ? '0 2px 8px #bae6fd' : 'none',
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