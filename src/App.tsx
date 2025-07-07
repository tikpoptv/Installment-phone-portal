import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/admin/Navbar';
import Dashboard from './pages/admin/dashboard/Dashboard';
import AdminLogin from './pages/admin/auth/Login';
import UserLogin from './pages/user/auth/Login';
import UserRegister from './pages/user/auth/Register';
import UserDashboard from './pages/user/dashboard/Dashboard';
import styles from './App.module.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ErrorPage from './components/ErrorPage';
import ContractDetailPage from './pages/user/contract/ContractDetailPage';
import CustomerListPage from './pages/admin/customers/CustomerListPage';
import CustomerDetailPage from './pages/admin/customers/CustomerDetailPage';
import ProductListPage from './pages/admin/products/ProductListPage';
import ProductDetailPage from './pages/admin/products/ProductDetailPage';
import SessionExpiredModal from './components/SessionExpiredModal';
import OrderListPage from './pages/admin/orders/OrderListPage';
import ErrorBackendModal from './components/ErrorBackendModal';
import Settings from './pages/admin/settings/Settings';
import OrderDetailPage from './pages/admin/orders/OrderDetailPage';
import IcloudListPage from './pages/admin/icloud/IcloudListPage';

// Loading Component
function LoadingScreen() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      backgroundColor: '#f8fafc'
    }}>
      <div style={{
        width: '50px',
        height: '50px',
        border: '5px solid #e2e8f0',
        borderTop: '5px solid #0ea5e9',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <p style={{ 
        marginTop: '1rem',
        color: '#64748b',
        fontSize: '1.125rem'
      }}>
        กำลังตรวจสอบสิทธิ์การเข้าถึง...
      </p>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

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
  const [isLoading, setIsLoading] = useState(() => {
    // เช็คว่าเคยโหลดแล้วหรือยัง
    const hasLoaded = localStorage.getItem('app_initialized');
    return !hasLoaded;
  });

  const [sessionExpired, setSessionExpired] = useState(false);

  const navigate = useNavigate();

  // อ่านค่าจาก env
  const ADMIN_DOMAIN = import.meta.env.VITE_ADMIN_DOMAIN;
  const USER_DOMAIN = import.meta.env.VITE_USER_DOMAIN;
  const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';
  const DEV_DOMAIN = import.meta.env.VITE_DEV_DOMAIN;
  const DEV_ROLE = import.meta.env.VITE_DEV_ROLE || 'user';

  // เช็ค domain ปัจจุบัน
  const currentDomain = window.location.host;
  const isDevDomain = currentDomain.includes('localhost') || currentDomain.includes('127.0.0.1');
  const isAdminDomain = currentDomain === ADMIN_DOMAIN;
  const isUserDomain = currentDomain === USER_DOMAIN;

  // ตรวจสอบ domain ที่อนุญาต
  const isAllowedDomain = isDevDomain || isAdminDomain || isUserDomain;

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

  // เช็ค login
  const isLoggedIn = localStorage.getItem('auth_token');

  useEffect(() => {
    if (isLoading) {
      // จำลองการโหลดข้อมูล
      const timer = setTimeout(() => {
        setIsLoading(false);
        // บันทึกว่าครั้งนี้โหลดแล้ว
        localStorage.setItem('app_initialized', 'true');

        // ถ้าไม่ได้ login ให้ redirect ไปหน้า login
        if (!isLoggedIn) {
          if (showAdminUI) {
            navigate('/admin/login');
          } else if (showUserUI) {
            navigate('/user/login');
          }
        }
      }, 1000); // 1 วินาที

      return () => clearTimeout(timer);
    }
  }, [isLoading, isLoggedIn, showAdminUI, showUserUI, navigate]);

  useEffect(() => {
    const handler = () => setSessionExpired(true);
    window.addEventListener('session-expired', handler);
    return () => window.removeEventListener('session-expired', handler);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (sessionExpired) {
    return <SessionExpiredModal open={true} />;
  }

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

  if (!isAllowedDomain) {
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

  return (
    <Routes>
      {/* Root Route */}
      <Route path="/" element={
        isLoggedIn ? (
          <Navigate to={showAdminUI ? "/admin" : "/user"} replace />
        ) : (
          <Navigate to={showAdminUI ? "/admin/login" : "/user/login"} replace />
        )
      } />
      
      {/* Admin Routes */}
      {showAdminUI && (
        <>
          <Route path="/admin/login" element={
            isLoggedIn ? (
              <Navigate to="/admin" replace />
            ) : (
              <AdminLogin />
            )
          } />
          <Route path="/admin/*" element={
            isLoggedIn ? (
              <div className={styles.app}>
                <Navbar />
                <main className={styles.mainContent}>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="customers" element={<CustomerListPage />} />
                    <Route path="customers/:id" element={<CustomerDetailPage />} />
                    <Route path="products" element={<ProductListPage />} />
                    <Route path="products/:id" element={<ProductDetailPage />} />
                    <Route path="orders" element={<OrderListPage />} />
                    <Route path="orders/:id" element={<OrderDetailPage />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="icloud" element={<IcloudListPage />} />
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
          <Route path="/user/login" element={
            isLoggedIn ? (
              <Navigate to="/user" replace />
            ) : (
              <UserLogin />
            )
          } />
          <Route path="/user/register" element={
            isLoggedIn ? (
              <Navigate to="/user" replace />
            ) : localStorage.getItem('accept_privacy_policy') === 'yes' ? (
              <UserRegister />
            ) : (
              <Navigate to="/user/login" replace />
            )
          } />
          <Route path="/user/contract/:id" element={<ContractDetailPage />} />
          <Route path="/user/*" element={
            isLoggedIn ? (
              <UserDashboard />
            ) : (
              <Navigate to="/user/login" replace />
            )
          } />
        </>
      )}

      {/* Global Error Page */}
      <Route path="/error" element={<ErrorPage />} />

      {/* 404 Route - สำหรับ path ที่ไม่มีอยู่จริง */}
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
      <ToastContainer position="top-right" autoClose={3000} />
      <ErrorBackendModal />
    </Router>
  );
}

export default App;
