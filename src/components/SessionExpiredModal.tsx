import React, { useEffect, useState } from 'react';

interface SessionExpiredModalProps {
  open: boolean;
}

const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({ open }) => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!open) return;
    setCountdown(5);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // ลบ localStorage ทั้งหมด (logout)
          localStorage.clear();
          window.location.reload();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [open]);

  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(30,41,59,0.18)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 12
    }}>
      <div style={{
        background: '#fff', borderRadius: 18, padding: '38px 32px 28px 32px', minWidth: 320, maxWidth: 380, width: '100%',
        boxShadow: '0 8px 32px #bae6fd', textAlign: 'center', position: 'relative',
      }}>
        <div style={{ fontSize: 44, marginBottom: 10, color: '#ef4444' }}>⏰</div>
        <div style={{ fontWeight: 700, fontSize: '1.25rem', color: '#0ea5e9', marginBottom: 10 }}>เซสชันหมดอายุ</div>
        <div style={{ color: '#334155', fontSize: '1.07rem', marginBottom: 18 }}>
          กรุณาเข้าสู่ระบบใหม่ หรือรีโหลดหน้า<br />เพื่อความปลอดภัยของข้อมูล
        </div>
        <div style={{ color: '#ef4444', fontWeight: 600, fontSize: '1.08rem', marginBottom: 18 }}>
          จะออกจากระบบอัตโนมัติใน {countdown} วินาที
        </div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8 }}>
          <button
            style={{ background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 24px', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 1px 4px #bae6fd', transition: 'background 0.18s' }}
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
          >เข้าสู่ระบบใหม่</button>
          <button
            style={{ background: '#e0e7ef', color: '#0ea5e9', border: 'none', borderRadius: 10, padding: '10px 24px', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 1px 4px #e0e7ef', transition: 'background 0.18s' }}
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
          >รีโหลดหน้า</button>
        </div>
      </div>
    </div>
  );
};

export default SessionExpiredModal; 