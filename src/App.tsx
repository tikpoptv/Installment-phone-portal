import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/admin/Navbar';
import Dashboard from './pages/admin/dashboard/Dashboard';
import Login from './pages/auth/Login';
import styles from './App.module.css';

function Error404() {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <h1 style={{ fontSize: '2.5rem', color: '#ef4444', marginBottom: '1rem' }}>404</h1>
      <p style={{ fontSize: '1.25rem', color: '#64748b', marginBottom: '2rem' }}>ไม่พบหน้าที่คุณต้องการ</p>
      <a href="/admin" style={{ color: '#0ea5e9', fontWeight: 600, textDecoration: 'underline', fontSize: '1rem' }}>กลับหน้าแดชบอร์ด</a>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/*" element={
          <div className={styles.app}>
            <Navbar />
            <main className={styles.mainContent}>
              <Routes>
                <Route index element={<Dashboard />} />
                {/* เพิ่ม routes อื่นๆ ของ admin ตรงนี้ */}
              </Routes>
            </main>
          </div>
        } />
        <Route path="*" element={<Error404 />} />
      </Routes>
    </Router>
  );
}

export default App;
