import React from 'react';

interface AccountLockedModalProps {
  open: boolean;
  onClose: () => void;
}

const AccountLockedModal: React.FC<AccountLockedModalProps> = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(30,41,59,0.32)', zIndex: 99999, display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 12, backdropFilter: 'blur(3px)'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #fff 80%, #fca5a5 100%)',
        borderRadius: 22, boxShadow: '0 8px 40px 0 rgba(239,68,68,0.18), 0 1.5px 8px #fecaca',
        padding: '44px 38px', maxWidth: 420, width: '100%', textAlign: 'center', position: 'relative',
        border: '1.5px solid #fecaca',
        transition: 'box-shadow 0.2s',
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 10, right: 10, background: 'none', border: 'none',
            fontSize: 26, color: '#64748b', cursor: 'pointer', borderRadius: '50%', width: 38, height: 38,
            transition: 'background 0.15s',
          }}
          aria-label="ปิด"
          onMouseOver={e => (e.currentTarget.style.background = '#f1f5f9')}
          onMouseOut={e => (e.currentTarget.style.background = 'none')}
        >×</button>
        <div style={{ fontSize: 54, marginBottom: 10, filter: 'drop-shadow(0 2px 8px #fca5a5)' }}>
          <span role="img" aria-label="locked">🔒</span>
        </div>
        <div style={{ fontWeight: 800, fontSize: '1.18rem', color: '#ef4444', marginBottom: 12, letterSpacing: 0.2 }}>บัญชีนี้ถูกล็อก</div>
        <div style={{ color: '#334155', fontSize: '1.07rem', marginBottom: 22, lineHeight: 1.7 }}>
          กรุณาติดต่อผู้ดูแลระบบเพื่อปลดล็อกบัญชีนี้
        </div>
        <button
          style={{
            background: 'linear-gradient(90deg, #38bdf8 0%, #0ea5e9 100%)', color: '#fff', border: 'none', borderRadius: 12,
            padding: '12px 32px', fontWeight: 700, fontSize: 17, cursor: 'pointer', boxShadow: '0 2px 8px #bae6fd',
            letterSpacing: 0.2, transition: 'background 0.18s, box-shadow 0.18s', minWidth: 120
          }}
          onClick={onClose}
          onMouseOver={e => (e.currentTarget.style.background = '#0ea5e9')}
          onMouseOut={e => (e.currentTarget.style.background = 'linear-gradient(90deg, #38bdf8 0%, #0ea5e9 100%)')}
        >ปิด</button>
      </div>
    </div>
  );
};

export default AccountLockedModal; 