import React from 'react';
import Navbar from '../../../components/admin/Navbar';
import styles from './Settings.module.css';

const Settings: React.FC = () => {
  return (
    <div className={styles.settingsContainer}>
      <Navbar />
      <div className={styles.content}>
        <h1>ตั้งค่าแอดมิน</h1>
        <section className={styles.section}>
          <h2>ข้อมูลโปรไฟล์</h2>
          <form className={styles.form}>
            <label>
              ชื่อผู้ใช้
              <input type="text" placeholder="ชื่อผู้ใช้" />
            </label>
            <label>
              อีเมล
              <input type="email" placeholder="อีเมล" />
            </label>
            <button type="submit">บันทึกข้อมูล</button>
          </form>
        </section>
        <section className={styles.section}>
          <h2>เปลี่ยนรหัสผ่าน</h2>
          <form className={styles.form}>
            <label>
              รหัสผ่านเดิม
              <input type="password" placeholder="รหัสผ่านเดิม" />
            </label>
            <label>
              รหัสผ่านใหม่
              <input type="password" placeholder="รหัสผ่านใหม่" />
            </label>
            <label>
              ยืนยันรหัสผ่านใหม่
              <input type="password" placeholder="ยืนยันรหัสผ่านใหม่" />
            </label>
            <button type="submit">เปลี่ยนรหัสผ่าน</button>
          </form>
        </section>
        <section className={styles.section}>
          <h2>ตั้งค่าการแจ้งเตือน</h2>
          <form className={styles.form}>
            <label>
              <input type="checkbox" /> รับการแจ้งเตือนทางอีเมล
            </label>
            <label>
              <input type="checkbox" /> รับการแจ้งเตือนทาง SMS
            </label>
            <button type="submit">บันทึกการตั้งค่า</button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Settings; 