import type { FC } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Navbar.module.css';

const Navbar: FC = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/admin', icon: '📊', label: 'Dashboard' },
    { path: '/admin/orders', icon: '📦', label: 'คำสั่งซื้อ' },
    { path: '/admin/products', icon: '📱', label: 'สินค้า' },
    { path: '/admin/customers', icon: '👥', label: 'ลูกค้า' },
    { path: '/admin/promotions', icon: '🎁', label: 'โปรโมชั่น' },
    { path: '/admin/settings', icon: '⚙️', label: 'ตั้งค่า' },
  ];

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.logoContainer}>
          <Link to="/admin" className={styles.logo}>
            <span className={styles.logoIcon}>📱</span>
            <span className={styles.logoText}>Admin Portal</span>
          </Link>
        </div>

        <ul className={styles.menuList}>
          {menuItems.map((item) => (
            <li key={item.path} className={styles.menuItemWrapper}>
              <Link
                to={item.path}
                className={`${styles.menuItem} ${
                  location.pathname === item.path ? styles.active : ''
                }`}
              >
                <span className={styles.menuIcon}>{item.icon}</span>
                <span className={styles.menuLabel}>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className={styles.bottomSection}>
          <button className={styles.logoutButton}>
            <span className={styles.logoutIcon}>🚪</span>
            <span className={styles.logoutText}>ออกจากระบบ</span>
          </button>

          <div className={styles.userBox}>
            <span className={styles.userAvatar}>A</span>
            <div className={styles.userInfo}>
              <span className={styles.userName}>Admin User</span>
              <span className={styles.userRole}>ผู้ดูแลระบบ</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 