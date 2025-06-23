import React from 'react';
import styles from '../Dashboard.module.css';

interface UserSummaryProps {
  user: {
    name: string;
    phone: string;
    balance: number;
  };
}

const UserSummary: React.FC<UserSummaryProps> = ({ user }) => {
  return (
    <div className={styles.card + ' ' + styles.userSummary}>
      <div className={styles.avatarBox}>
        <div className={styles.avatar}>{user.name[0]}</div>
      </div>
      <div className={styles.userInfoBox}>
        <div className={styles.userName}>สวัสดี, {user.name}</div>
        <div className={styles.userPhone}>เบอร์โทรศัพท์: <b>{user.phone}</b></div>
        <div className={styles.userBalance}>
          ยอดคงเหลือที่ต้องชำระ: <span className={styles.userBalanceAmount}>{user.balance.toLocaleString()} บาท</span>
        </div>
      </div>
    </div>
  );
};

export default UserSummary; 