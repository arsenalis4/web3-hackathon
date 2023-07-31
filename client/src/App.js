import './App.css';
import { BrowserRouter as Router, Route, Routes  } from "react-router-dom";
import LoginPage from './pages/login';
import DashboardPage from './pages/dashboard';
import HistoryPage from './pages/history';
import WalletPage from './pages/wallet';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/history" element={<HistoryPage/>} />
        <Route path="/wallet" element={<WalletPage />} />
      </Routes>
    </Router>
  );
}

export default App;