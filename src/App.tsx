import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from './components/admin/Navbar';
import Dashboard from './pages/admin/dashboard/Dashboard';
import styles from './App.module.css';

function App() {
  return (
    <Router>
      <div className={styles.app}>
        <Navbar />
        <main className={styles.mainContent}>
          <Dashboard />
        </main>
      </div>
    </Router>
  );
}

export default App;
