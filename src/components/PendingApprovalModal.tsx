import React from 'react';
import styles from './PrivacyPolicyModal.module.css';

interface PendingApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PendingApprovalModal: React.FC<PendingApprovalModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} style={{ 
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        border: '1px solid #e2e8f0',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
      }}>
        {/* Icon */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: 24,
          fontSize: 64,
          filter: 'drop-shadow(0 4px 8px rgba(14, 165, 233, 0.3))'
        }}>
          <span role="img" aria-label="pending">⏳</span>
        </div>

        {/* Title */}
        <h2 style={{ 
          marginBottom: 16, 
          fontSize: '1.4rem', 
          color: '#0f172a',
          textAlign: 'center',
          fontWeight: 700,
          letterSpacing: '-0.025em'
        }}>
          บัญชีของคุณอยู่ระหว่างรอการยืนยันตัวตน
        </h2>

        {/* Content */}
        <div style={{ 
          color: '#475569', 
          fontSize: '1.05rem', 
          marginBottom: 32, 
          textAlign: 'center',
          lineHeight: 1.6,
          padding: '0 8px'
        }}>
          กรุณารอให้แอดมินตรวจสอบและยืนยันตัวตนของคุณก่อนเข้าสู่ระบบ
          <br />
          <span style={{ fontSize: '0.95rem', color: '#64748b' }}>
            หากต้องการสอบถามเพิ่มเติม กรุณาติดต่อเจ้าหน้าที่
          </span>
        </div>

        {/* Button */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={onClose}
            style={{
              background: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 12,
              padding: '14px 32px',
              fontSize: '1.05rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 14px 0 rgba(14, 165, 233, 0.25)',
              transition: 'all 0.2s ease-in-out',
              minWidth: 140,
              letterSpacing: '0.025em'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px 0 rgba(14, 165, 233, 0.35)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(14, 165, 233, 0.25)';
            }}
          >
            เข้าใจแล้ว
          </button>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'rgba(241, 245, 249, 0.8)',
            border: 'none',
            borderRadius: '50%',
            width: 36,
            height: 36,
            fontSize: 20,
            color: '#64748b',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease-in-out',
            backdropFilter: 'blur(8px)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
            e.currentTarget.style.color = '#ef4444';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(241, 245, 249, 0.8)';
            e.currentTarget.style.color = '#64748b';
          }}
          aria-label="ปิด"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default PendingApprovalModal; 