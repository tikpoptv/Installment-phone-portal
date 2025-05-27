import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/admin/Navbar';
import Dashboard from './pages/admin/dashboard/Dashboard';
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
      <div className={styles.app}>
        <Navbar />
        <main className={styles.mainContent}>
          <Routes>
            <Route path="/" element={<Navigate to="/admin" replace />} />
            <Route path="/admin" element={<Dashboard />} />
            <Route path="*" element={<Error404 />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
