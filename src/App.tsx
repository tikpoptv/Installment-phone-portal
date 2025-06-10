import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/admin/Navbar';
import Dashboard from './pages/admin/dashboard/Dashboard';
import AdminLogin from './pages/admin/auth/Login';
import UserLogin from './pages/user/auth/Login';
import styles from './App.module.css';

function Error404() {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <h1 style={{ fontSize: '2.5rem', color: '#ef4444', marginBottom: '1rem' }}>404</h1>
      <p style={{ fontSize: '1.25rem', color: '#64748b', marginBottom: '2rem' }}>ไม่พบหน้าที่คุณต้องการ</p>
      <a href="/" style={{ color: '#0ea5e9', fontWeight: 600, textDecoration: 'underline', fontSize: '1rem' }}>กลับหน้าแรก</a>
    </div>
  );
}

function AppContent() {
  // อ่านค่าจาก env
  const ADMIN_DOMAIN = import.meta.env.VITE_ADMIN_DOMAIN;
  const USER_DOMAIN = import.meta.env.VITE_USER_DOMAIN;
  const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';
  const DEV_DOMAIN = import.meta.env.VITE_DEV_DOMAIN;
  const DEV_ROLE = import.meta.env.VITE_DEV_ROLE || 'user';

  // ตรวจสอบ env ที่จำเป็น
  const isEnvValid = 
    typeof ADMIN_DOMAIN === 'string' && ADMIN_DOMAIN.length > 0 &&
    typeof USER_DOMAIN === 'string' && USER_DOMAIN.length > 0 &&
    typeof DEV_DOMAIN === 'string' && DEV_DOMAIN.length > 0 &&
    typeof DEV_ROLE === 'string' && ['admin', 'user'].includes(DEV_ROLE);

  if (!isEnvValid) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#dc2626' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: '600', marginBottom: '1rem' }}>ไม่สามารถเข้าถึงระบบได้</h1>
        <p style={{ fontSize: '1.125rem', color: '#4b5563', marginBottom: '1.5rem' }}>
          เกิดข้อผิดพลาดในการตรวจสอบการตั้งค่าระบบ
        </p>
        <div style={{ 
          backgroundColor: '#fef2f2', 
          border: '1px solid #fee2e2',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          maxWidth: '32rem',
          margin: '0 auto',
          textAlign: 'left'
        }}>
          <p style={{ color: '#991b1b', marginBottom: '1rem', fontWeight: '500' }}>
            กรุณาตรวจสอบการตั้งค่าต่อไปนี้ในไฟล์ .env:
          </p>
          <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', color: '#7f1d1d' }}>
            <li style={{ marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: '500' }}>VITE_ADMIN_DOMAIN:</span> โดเมนสำหรับระบบผู้ดูแล
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: '500' }}>VITE_USER_DOMAIN:</span> โดเมนสำหรับผู้ใช้งานทั่วไป
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: '500' }}>VITE_DEV_DOMAIN:</span> โดเมนสำหรับการพัฒนา
            </li>
            <li>
              <span style={{ fontWeight: '500' }}>VITE_DEV_ROLE:</span> กำหนดบทบาทในการพัฒนา (admin หรือ user)
            </li>
          </ul>
        </div>
      </div>
    );
  }

  // เช็ค domain ปัจจุบัน
  const currentDomain = window.location.host;
  const isDevDomain = currentDomain.includes('localhost') || currentDomain.includes('127.0.0.1');
  const isAdminDomain = currentDomain === ADMIN_DOMAIN;
  const isUserDomain = currentDomain === USER_DOMAIN;

  // Debug Log 1: ตรวจสอบค่า domain และ env
  console.log('Debug Domain Check:', {
    currentDomain,
    ADMIN_DOMAIN,
    USER_DOMAIN,
    DEV_DOMAIN,
    isDevDomain,
    isAdminDomain,
    isUserDomain,
    DEV_MODE,
    DEV_ROLE,
    windowLocation: window.location.href
  });

  // ตรวจสอบ domain ที่อนุญาต
  const isAllowedDomain = isDevDomain || isAdminDomain || isUserDomain;

  if (!isAllowedDomain) {
    console.log('Debug: Domain ไม่ได้รับอนุญาต', {
      currentDomain,
      isAllowedDomain,
      isDevDomain,
      isAdminDomain,
      isUserDomain
    });
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'red' }}>
        <h1>ไม่อนุญาตให้เข้าถึง</h1>
        <p>domain ไม่ถูกต้อง<br />กรุณาเข้าผ่าน domain ที่อนุญาต</p>
        <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>
          <p>Domain ปัจจุบัน: {currentDomain}</p>
          <p>Domain ที่อนุญาต:</p>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li>- {ADMIN_DOMAIN} (สำหรับผู้ดูแล)</li>
            <li>- {USER_DOMAIN} (สำหรับผู้ใช้งาน)</li>
            {DEV_MODE && <li>- {DEV_DOMAIN} (สำหรับการพัฒนา)</li>}
          </ul>
        </div>
      </div>
    );
  }

  // เช็ค login
  const isLoggedIn = localStorage.getItem('token');

  // ตรวจสอบว่าจะแสดง UI แบบไหน
  let showAdminUI = false;
  let showUserUI = false;

  if (DEV_MODE) {
    // โหมดพัฒนา: ใช้ DEV_ROLE ในการตัดสินใจ
    showAdminUI = isDevDomain && DEV_ROLE === 'admin';
    showUserUI = isDevDomain && DEV_ROLE === 'user';
  } else {
    // โหมดปกติ: ใช้ domain ในการตัดสินใจ
    showAdminUI = isAdminDomain;
    showUserUI = isUserDomain;
  }

  // Debug Log 2: ตรวจสอบค่า UI และ login
  console.log('Debug UI Check:', {
    DEV_MODE,
    isDevDomain,
    isAdminDomain,
    isUserDomain,
    showAdminUI,
    showUserUI,
    isLoggedIn,
    DEV_ROLE
  });

  // ถ้าไม่ได้ login ให้ไปหน้า login ตาม role
  if (!isLoggedIn) {
    console.log('Debug: ยังไม่ได้ login, redirect ไปหน้า login', {
      showAdminUI,
      showUserUI,
      currentPath: window.location.pathname
    });

    // ถ้าอยู่ที่หน้า login อยู่แล้ว ไม่ต้อง redirect
    if (window.location.pathname === '/user/login' || window.location.pathname === '/admin/login') {
      console.log('Debug: อยู่ที่หน้า login อยู่แล้ว ไม่ต้อง redirect');
      return (
        <Routes>
          {showAdminUI && <Route path="/admin/login" element={<AdminLogin />} />}
          {showUserUI && <Route path="/user/login" element={<UserLogin />} />}
        </Routes>
      );
    }

    // ถ้าไม่ได้อยู่ที่หน้า login ให้ redirect
    if (showAdminUI) {
      console.log('Debug: redirect ไปหน้า admin login');
      return <Navigate to="/admin/login" replace />;
    } else if (showUserUI) {
      console.log('Debug: redirect ไปหน้า user login');
      return <Navigate to="/user/login" replace />;
    }
  }

  // Debug Log 3: ตรวจสอบการ render routes
  console.log('Debug: กำลัง render routes', {
    showAdminUI,
    showUserUI,
    isLoggedIn,
    currentPath: window.location.pathname
  });

  return (
    <Routes>
      {/* Root Route */}
      <Route path="/" element={<Navigate to={showAdminUI ? "/admin/login" : "/user/login"} replace />} />
      
      {/* Admin Routes */}
      {showAdminUI && (
        <>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/*" element={
            isLoggedIn ? (
              <div className={styles.app}>
                <Navbar />
                <main className={styles.mainContent}>
                  <Routes>
                    <Route index element={<Dashboard />} />
                    {/* เพิ่ม routes อื่นๆ ของ admin ตรงนี้ */}
                    <Route path="*" element={<Error404 />} />
                  </Routes>
                </main>
              </div>
            ) : (
              <Navigate to="/admin/login" replace />
            )
          } />
        </>
      )}

      {/* User Routes */}
      {showUserUI && (
        <>
          <Route path="/user/login" element={<UserLogin />} />
          <Route path="/user/*" element={
            isLoggedIn ? (
              <div className={styles.app}>
                <main className={styles.mainContent}>
                  <Routes>
                    <Route index element={<Dashboard />} />
                    {/* เพิ่ม routes อื่นๆ ของ user ตรงนี้ */}
                    <Route path="*" element={<Error404 />} />
                  </Routes>
                </main>
              </div>
            ) : (
              <Navigate to="/user/login" replace />
            )
          } />
        </>
      )}

      {/* 404 Route - สำหรับ path ที่ไม่มีอยู่จริง */}
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
