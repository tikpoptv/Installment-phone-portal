import React, { useEffect, useState } from 'react';

const modalStyle: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
  background: 'rgba(30,41,59,0.32)', zIndex: 99999, display: 'flex',
  alignItems: 'center', justifyContent: 'center', padding: 12, backdropFilter: 'blur(3px)'
};
const contentStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #fff 80%, #e0f2fe 100%)',
  borderRadius: 22, boxShadow: '0 8px 40px 0 rgba(14,165,233,0.18), 0 1.5px 8px #bae6fd',
  padding: '44px 38px', maxWidth: 560, width: '100%', textAlign: 'center', position: 'relative',
  border: '1.5px solid #bae6fd',
  transition: 'box-shadow 0.2s',
};

export default function ErrorBackendModal() {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState<string>('');
  const [title, setTitle] = useState<string>('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const msg = detail?.message || '';
      let autoTitle = '';
      if (/เซิร์ฟเวอร์|server/i.test(msg)) {
        autoTitle = 'เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์';
      }
      setMsg(msg);
      setTitle(detail?.title || autoTitle);
      setOpen(true);
    };
    window.addEventListener('error-backend', handler);
    return () => window.removeEventListener('error-backend', handler);
  }, []);

  // Default message (ทางการ)
  const defaultTitle = 'เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์';
  const defaultMsg = `ขณะนี้ไม่สามารถติดต่อกับเซิร์ฟเวอร์ของระบบได้ อาจเกิดจากปัญหาการเชื่อมต่ออินเทอร์เน็ตของคุณ หรือเซิร์ฟเวอร์อาจอยู่ระหว่างการปรับปรุงชั่วคราว\n\nกรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต หรือลองรีเฟรชหน้าใหม่อีกครั้ง หากยังพบปัญหา กรุณาติดต่อเจ้าหน้าที่เพื่อให้ช่วยตรวจสอบและแก้ไขโดยเร็วที่สุด\n\nขออภัยในความไม่สะดวก และขอขอบคุณที่ไว้วางใจใช้งานระบบของเรา`;

  if (!open) return null;
  return (
    <div style={modalStyle}>
      <div style={contentStyle}>
        <button
          onClick={() => setOpen(false)}
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
          <span role="img" aria-label="error">🚫</span>
        </div>
        <div style={{ fontWeight: 800, fontSize: '1.18rem', color: '#ef4444', marginBottom: 12, letterSpacing: 0.2 }}>{title || defaultTitle}</div>
        <div style={{ color: '#334155', fontSize: '1.07rem', marginBottom: 22, lineHeight: 1.7, whiteSpace: 'pre-line', wordBreak: 'break-word' }}>
          {msg || defaultMsg}
        </div>
        <button
          style={{
            background: 'linear-gradient(90deg, #38bdf8 0%, #0ea5e9 100%)', color: '#fff', border: 'none', borderRadius: 12,
            padding: '12px 32px', fontWeight: 700, fontSize: 17, cursor: 'pointer', boxShadow: '0 2px 8px #bae6fd',
            letterSpacing: 0.2, transition: 'background 0.18s, box-shadow 0.18s',
          }}
          onClick={() => window.location.reload()}
          onMouseOver={e => (e.currentTarget.style.background = '#0ea5e9')}
          onMouseOut={e => (e.currentTarget.style.background = 'linear-gradient(90deg, #38bdf8 0%, #0ea5e9 100%)')}
        >รีโหลดหน้า</button>
        <style>{`
          @media (max-width: 600px) {
            .error-backend-modal-content {
              padding: 18px 4px !important;
              max-width: 98vw !important;
              font-size: 0.98rem !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
} 