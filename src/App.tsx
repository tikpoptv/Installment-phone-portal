import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from './components/admin/Navbar';
import Dashboard from './pages/admin/Dashboard';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <div className="main-content">
          <Dashboard />
        </div>
      </div>
    </Router>
  );
}

export default App;
