import React from 'react';

const ErrorPage: React.FC = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)',
    padding: '24px',
  }}>
    <div style={{
      background: '#fff',
      borderRadius: 18,
      boxShadow: '0 8px 32px rgba(30,41,59,0.13)',
      maxWidth: 420,
      width: '100%',
      padding: '40px 28px 32px 28px',
      textAlign: 'center',
      position: 'relative',
    }}>
      <div style={{
        fontSize: 48,
        color: '#ef4444',
        marginBottom: 16,
        lineHeight: 1,
        filter: 'drop-shadow(0 2px 8px #fca5a5a0)'
      }}>⛔</div>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#dc2626', marginBottom: 12, letterSpacing: 0.5 }}>เกิดข้อผิดพลาดในการดึงข้อมูล</h1>
      <p style={{ fontSize: '0.98rem', color: '#64748b', marginBottom: 18, maxWidth: 340, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.7 }}>
        ขณะนี้ระบบไม่สามารถดึงข้อมูลที่คุณร้องขอได้ อาจเกิดจากปัญหาการเชื่อมต่ออินเทอร์เน็ตของคุณ หรือเกิดข้อขัดข้องบางอย่างในฝั่งเซิร์ฟเวอร์ของระบบ
      </p>
      <ul style={{
        textAlign: 'left',
        display: 'inline-block',
        margin: '0 0 14px 0',
        color: '#64748b',
        fontSize: '0.98em',
        paddingLeft: 22,
        lineHeight: 1.6,
      }}>
        <li>ตรวจสอบการเชื่อมต่ออินเทอร์เน็ตของคุณว่ายังใช้งานได้ปกติ</li>
        <li>ลองรีเฟรชหน้าเว็บใหม่อีกครั้ง</li>
        <li>หากยังพบปัญหา กรุณาติดต่อผู้ดูแลระบบเพื่อให้ช่วยตรวจสอบและแก้ไขโดยเร็วที่สุด</li>
      </ul>
      <div style={{ color: '#ef4444', fontWeight: 500, marginBottom: 18, fontSize: '0.98em' }}>
        ขออภัยในความไม่สะดวก และขอบคุณที่ไว้วางใจใช้งานระบบของเรา
      </div>
      <a
        href="/"
        style={{
          display: 'inline-block',
          background: 'linear-gradient(90deg, #0ea5e9 0%, #38bdf8 100%)',
          color: '#fff',
          fontWeight: 600,
          borderRadius: 22,
          padding: '8px 28px',
          fontSize: '1em',
          textDecoration: 'none',
          boxShadow: '0 2px 8px rgba(14,165,233,0.13)',
          transition: 'background 0.18s, color 0.18s',
        }}
        onMouseOver={e => (e.currentTarget.style.background = 'linear-gradient(90deg, #38bdf8 0%, #0ea5e9 100%)')}
        onMouseOut={e => (e.currentTarget.style.background = 'linear-gradient(90deg, #0ea5e9 0%, #38bdf8 100%)')}
      >
        กลับหน้าแรก
      </a>
    </div>
  </div>
);

export default ErrorPage; 