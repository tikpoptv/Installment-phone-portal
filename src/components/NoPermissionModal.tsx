import React, { useEffect, useState } from 'react';

const modalStyle: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
  background: 'rgba(30,41,59,0.32)', zIndex: 99999, display: 'flex',
  alignItems: 'center', justifyContent: 'center', padding: 12, backdropFilter: 'blur(3px)'
};
const contentStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #fff 80%, #fffbe6 100%)',
  borderRadius: 28, boxShadow: '0 8px 40px 0 rgba(251,191,36,0.18), 0 1.5px 8px #fde68a',
  padding: '48px 38px 38px 38px', maxWidth: 420, width: '100%', textAlign: 'center', position: 'relative',
  border: '2px solid #fde68a',
  transition: 'box-shadow 0.2s',
};

export default function NoPermissionModal() {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState<string>('คุณไม่มีสิทธิ์เข้าถึงหน้านี้ เฉพาะผู้ใช้ที่มีสิทธิ์ Super Admin เท่านั้น');
  const [title, setTitle] = useState<string>('ไม่มีสิทธิ์เข้าถึง');

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setMsg(detail?.message || 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้ เฉพาะผู้ใช้ที่มีสิทธิ์ Super Admin เท่านั้น');
      setTitle(detail?.title || 'ไม่มีสิทธิ์เข้าถึง');
      setOpen(true);
    };
    window.addEventListener('no-permission', handler);
    return () => window.removeEventListener('no-permission', handler);
  }, []);

  if (!open) return null;
  return (
    <div style={modalStyle}>
      <div style={contentStyle}>
        <button
          onClick={() => setOpen(false)}
          style={{
            position: 'absolute', top: 12, right: 12, background: 'none', border: 'none',
            fontSize: 30, color: '#f59e42', cursor: 'pointer', borderRadius: '50%', width: 44, height: 44,
            transition: 'background 0.15s', fontWeight: 700
          }}
          aria-label="ปิด"
          onMouseOver={e => (e.currentTarget.style.background = '#fffbe6')}
          onMouseOut={e => (e.currentTarget.style.background = 'none')}
        >×</button>
        <div style={{ fontSize: 64, marginBottom: 16, filter: 'drop-shadow(0 2px 12px #fde68a)' }}>
          <span role="img" aria-label="warning">⚠️</span>
        </div>
        <div style={{ fontWeight: 900, fontSize: '1.35rem', color: '#f59e42', marginBottom: 16, letterSpacing: 0.2 }}>{title}</div>
        <div style={{ color: '#334155', fontSize: '1.13rem', marginBottom: 28, lineHeight: 1.8, whiteSpace: 'pre-line', wordBreak: 'break-word', fontWeight: 500 }}>
          {msg}
        </div>
        <button
          style={{
            background: 'linear-gradient(90deg, #fbbf24 0%, #f59e42 100%)', color: '#fff', border: 'none', borderRadius: 16,
            padding: '14px 38px', fontWeight: 800, fontSize: 19, cursor: 'pointer', boxShadow: '0 2px 8px #fde68a',
            letterSpacing: 0.2, transition: 'background 0.18s, box-shadow 0.18s', marginTop: 8
          }}
          onClick={() => setOpen(false)}
          onMouseOver={e => (e.currentTarget.style.background = '#f59e42')}
          onMouseOut={e => (e.currentTarget.style.background = 'linear-gradient(90deg, #fbbf24 0%, #f59e42 100%)')}
        >ปิด</button>
        <style>{`
          @media (max-width: 600px) {
            .no-permission-modal-content {
              padding: 18px 4px !important;
              max-width: 98vw !important;
              font-size: 1rem !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
} 