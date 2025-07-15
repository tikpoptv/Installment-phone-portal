import React from 'react';
import styles from './CreateAdminModal.module.css';
// import QRCode from 'qrcode.react';

interface CreateAdminSuccessModalProps {
  open: boolean;
  onClose: () => void;
  createToken: string;
  username: string;
  role: string;
  createdAt: string;
}

const getInviteUrl = (token: string) => `${window.location.origin}/create-admin/${token}`;

const CreateAdminSuccessModal: React.FC<CreateAdminSuccessModalProps> = ({ open, onClose, createToken, username, role, createdAt }) => {
  if (!open) return null;
  const inviteUrl = getInviteUrl(createToken);
  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="ปิด">×</button>
        <h2 className={styles.title}>สร้างแอดมินสำเร็จ</h2>
        <div style={{textAlign:'center', marginBottom:18}}>
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(inviteUrl)}`}
            alt="QR Code สร้างแอดมิน"
            style={{ width: 220, height: 220, borderRadius: 12, border: '1.5px solid #e0e7ef', background: '#f8fafc' }}
          />
        </div>
        <div style={{textAlign:'center', marginBottom:10, color:'#0ea5e9', fontWeight:600, fontSize:'1.08rem'}}>
          {username} ({role})
        </div>
        <div style={{textAlign:'center', marginBottom:18, color:'#64748b', fontSize:'0.98rem'}}>
          สร้างเมื่อ: {new Date(createdAt).toLocaleString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </div>
        <div style={{textAlign:'center', marginBottom:10, fontSize:'1.01rem', wordBreak:'break-all'}}>
          <a href={inviteUrl} target="_blank" rel="noopener noreferrer" style={{color:'#0ea5e9', fontWeight:700, textDecoration:'underline'}}>{inviteUrl}</a>
        </div>
        <div style={{textAlign:'center'}}>
          <button className={styles.submitBtn} onClick={onClose} style={{minWidth:120}}>ปิด</button>
        </div>
      </div>
    </div>
  );
};

export default CreateAdminSuccessModal; 