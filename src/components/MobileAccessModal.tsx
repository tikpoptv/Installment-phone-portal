import React from 'react';

interface MobileAccessModalProps {
  open: boolean;
  mode: 'warn' | 'block';
  onContinue?: () => void;
  onCancel?: () => void;
}

const MobileAccessModal: React.FC<MobileAccessModalProps> = ({ open, mode, onContinue, onCancel }) => {
  if (!open) return null;
  const isWarn = mode === 'warn';
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.18)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 12
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 18,
        padding: '32px 20px 24px 20px',
        minWidth: 280,
        maxWidth: 360,
        width: '100%',
        boxShadow: '0 6px 32px rgba(14,165,233,0.13)',
        textAlign: 'center',
        border: isWarn ? '2.5px solid #0ea5e9' : '2.5px solid #ef4444',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{
          fontSize: 38,
          marginBottom: 8,
          marginTop: -8,
          color: isWarn ? '#0ea5e9' : '#ef4444',
          filter: isWarn ? 'drop-shadow(0 2px 8px #bae6fd)' : 'drop-shadow(0 2px 8px #fecaca)'
        }}>
          {isWarn ? '🖥️' : '⚠️'}
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: isWarn ? '#0ea5e9' : '#ef4444', marginBottom: 12, letterSpacing: 0.2 }}>{isWarn ? 'ฟีเจอร์นี้เหมาะกับหน้าจอใหญ่' : 'ขออภัย ไม่สามารถใช้งานฟีเจอร์นี้บนมือถือได้'}</div>
        <div style={{ color: '#334155', fontSize: 16, marginBottom: 24, lineHeight: 1.7 }}>
          {isWarn ? (
            <>
              หน้านี้ไม่ได้ถูกออกแบบมาสำหรับมือถือ<br />
              การแสดงผลอาจผิดเพี้ยนหรือใช้งานไม่สะดวก<br />
              <span style={{ color: '#f59e42', fontWeight: 600 }}>แนะนำให้ใช้งานบน iPad หรือคอมพิวเตอร์เพื่อประสบการณ์ที่ดีที่สุด</span><br />
              <br />คุณต้องการดำเนินการต่อหรือไม่?
            </>
          ) : (
            <>
              เนื่องจากข้อมูลที่ต้องแสดงมีจำนวนมาก หรือฟีเจอร์นี้ไม่รองรับการใช้งานบนหน้าจอขนาดเล็ก<br />
              <span style={{ color: '#f59e42', fontWeight: 600 }}>กรุณาใช้งานฟีเจอร์นี้ผ่าน iPad หรือคอมพิวเตอร์เท่านั้น</span>
            </>
          )}
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', width: '100%' }}>
          {isWarn ? (
            <>
              <button style={{
                background: 'linear-gradient(90deg, #0ea5e9 0%, #38bdf8 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                padding: '10px 18px',
                fontWeight: 600,
                fontSize: 16,
                cursor: 'pointer',
                flex: 1,
                boxShadow: '0 1px 4px #bae6fd',
                transition: 'background 0.18s, color 0.18s',
              }}
                onMouseOver={e => (e.currentTarget.style.background = '#0ea5e9')}
                onMouseOut={e => (e.currentTarget.style.background = 'linear-gradient(90deg, #0ea5e9 0%, #38bdf8 100%)')}
                onClick={onContinue}
              >ดำเนินการต่อ</button>
              <button style={{
                background: '#e0e7ef',
                color: '#0ea5e9',
                border: 'none',
                borderRadius: 10,
                padding: '10px 18px',
                fontWeight: 600,
                fontSize: 16,
                cursor: 'pointer',
                flex: 1,
                boxShadow: '0 1px 4px #e0e7ef',
                transition: 'background 0.18s, color 0.18s',
              }}
                onMouseOver={e => (e.currentTarget.style.background = '#bae6fd')}
                onMouseOut={e => (e.currentTarget.style.background = '#e0e7ef')}
                onClick={onCancel}
              >ยกเลิก</button>
            </>
          ) : (
            <button style={{
              background: '#e0e7ef',
              color: '#0ea5e9',
              border: 'none',
              borderRadius: 10,
              padding: '10px 18px',
              fontWeight: 600,
              fontSize: 16,
              cursor: 'pointer',
              flex: 1,
              boxShadow: '0 1px 4px #e0e7ef',
              transition: 'background 0.18s, color 0.18s',
            }}
              onMouseOver={e => (e.currentTarget.style.background = '#bae6fd')}
              onMouseOut={e => (e.currentTarget.style.background = '#e0e7ef')}
              onClick={onCancel}
            >ปิด</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileAccessModal; 