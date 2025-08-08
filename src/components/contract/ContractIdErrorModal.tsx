import React from 'react';
import { toast } from 'react-toastify';

interface ContractIdErrorModalProps {
  open: boolean;
  onClose: () => void;
  onSwitchToManual: () => void;
}

const ContractIdErrorModal: React.FC<ContractIdErrorModalProps> = ({
  open,
  onClose,
  onSwitchToManual
}) => {
  if (!open) return null;

  const handleSwitchToManual = () => {
    onSwitchToManual();
    onClose();
    toast.success('เปลี่ยนเป็น "กรอกเลขคำสั่งซื้อเอง" แล้ว กรุณากรอกเลขคำสั่งซื้อและเลือกไฟล์ใหม่');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '20px',
        padding: '32px',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #e5e7eb',
        animation: 'modalSlideIn 0.3s ease-out'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #fef3c7 0%, #f59e0b 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 10px 25px rgba(245, 158, 11, 0.3)'
          }}>
            <span style={{ fontSize: '40px' }}>⚠️</span>
          </div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#1f2937',
            margin: '0 0 8px 0'
          }}>
            เกิดข้อผิดพลาดในระบบ
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#6b7280',
            margin: 0
          }}>
            ไม่พบเลขคำสั่งซื้อในระบบ
          </p>
        </div>

        {/* Content */}
        <div style={{
          background: '#f8fafc',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#374151',
            margin: '0 0 12px 0'
          }}>
            สาเหตุที่เป็นไปได้:
          </h3>
          <ul style={{
            margin: 0,
            paddingLeft: '20px',
            fontSize: '14px',
            lineHeight: '1.6',
            color: '#4b5563'
          }}>
            <li style={{ marginBottom: '8px' }}>
              <strong>ผู้ใช้อาจเปิดแท็บซ้อน</strong> ทำให้เลขคำสั่งซื้อสูญหาย
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>ระบบเกิดข้อผิดพลาด</strong> ระหว่างการสร้างคำสั่งซื้อ
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>เลขคำสั่งซื้อถูกลบ</strong> โดยไม่ตั้งใจ
            </li>
          </ul>
        </div>

        {/* Solution */}
        <div style={{
          background: '#f0f9ff',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          border: '1px solid #bae6fd'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}>
            <span style={{ fontSize: '18px' }}>💡</span>
            <span style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#0c4a6e'
            }}>
              วิธีแก้ไข:
            </span>
          </div>
          <p style={{
            fontSize: '14px',
            color: '#0c4a6e',
            margin: 0,
            lineHeight: '1.5'
          }}>
            ใช้ <strong>"กรอกเลขคำสั่งซื้อเอง"</strong> เพื่ออัปโหลดไฟล์และบันทึกข้อมูล
          </p>
        </div>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              background: '#f3f4f6',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              minWidth: '120px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#e5e7eb';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#f3f4f6';
            }}
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSwitchToManual}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              minWidth: '120px',
              boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(14, 165, 233, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(14, 165, 233, 0.3)';
            }}
          >
            เปลี่ยนเป็นกรอกเอง
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContractIdErrorModal; 