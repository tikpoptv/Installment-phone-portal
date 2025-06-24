import type { FC } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import styles from './Navbar.module.css';
import { authService } from '../../services/auth/auth.service';

interface UserData {
  name: string;
  role: string;
  avatar: string;
}

const Navbar: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
      if (window.innerWidth > 1024) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Simulate loading user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        await new Promise(resolve => setTimeout(resolve, 1000));
        // ดึง username จาก localStorage
        let username = 'Admin User';
        const userStr = localStorage.getItem('auth_user');
        if (userStr) {
          const user = JSON.parse(userStr);
          username = user.username || 'Admin User';
        }
        setUserData({
          name: username,
          role: 'ผู้ดูแลระบบ',
          avatar: (username[0] || 'A').toUpperCase()
        });
      } catch (err) {
        setError('ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
        console.error('Error loading user data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  const menuItems = [
    { path: '/admin', icon: '📊', label: 'Dashboard' },
    { path: '/admin/orders', icon: '📦', label: 'คำสั่งซื้อ' },
    { path: '/admin/products', icon: '📱', label: 'สินค้า' },
    { path: '/admin/customers', icon: '👥', label: 'ลูกค้า' },
    { path: '/admin/promotions', icon: '🎁', label: 'โปรโมชั่น' },
    { path: '/admin/settings', icon: '⚙️', label: 'ตั้งค่า' },
  ];

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/admin/login');
  };

  const renderUserSection = () => {
    if (isLoading) {
      return (
        <div className={styles.userBox}>
          <div className={styles.userAvatarLoading} />
          <div className={styles.userInfo}>
            <div className={styles.userNameLoading} />
            <div className={styles.userRoleLoading} />
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className={styles.userBox}>
          <div className={styles.userError}>
            <span className={styles.errorIcon}>⚠️</span>
            <span className={styles.errorText}>{error}</span>
          </div>
        </div>
      );
    }

    if (!userData) {
      return null;
    }

    return (
      <div className={styles.userBox}>
        <span className={styles.userAvatar}>{userData.avatar}</span>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{userData.name}</span>
          <span className={styles.userRole}>{userData.role}</span>
        </div>
      </div>
    );
  };

  return (
    <>
      {isMobile && (
        <button className={styles.mobileMenuButton} onClick={toggleMenu}>
          <span className={styles.mobileMenuIcon}>☰</span>
        </button>
      )}
      <nav className={`${styles.navbar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.container}>
          <div className={styles.logoContainer}>
            <Link to="/admin" className={styles.logo} onClick={() => setIsOpen(false)}>
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
                  onClick={() => setIsOpen(false)}
                >
                  <span className={styles.menuIcon}>{item.icon}</span>
                  <span className={styles.menuLabel}>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className={styles.bottomSection}>
            <button className={styles.logoutButton} onClick={handleLogout}>
              <span className={styles.logoutIcon}>🚪</span>
              <span className={styles.logoutText}>ออกจากระบบ</span>
            </button>

            {renderUserSection()}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar; 