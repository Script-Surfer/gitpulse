import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Navbar from './components/Navbar/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Pages
import HomePage from './pages/HomePage/HomePage.jsx';
import LoginPage from './pages/LoginPage/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage/RegisterPage.jsx';
import RepoDashboardPage from './pages/RepoDashboard/RepoDashboardPage.jsx';
import ComparePage from './pages/ComparePage/ComparePage.jsx';
import MyReposPage from './pages/MyReposPage/MyReposPage.jsx';
import SettingsPage from './pages/SettingsPage/SettingsPage.jsx';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/repo/:owner/:name" element={<RepoDashboardPage />} />
          <Route path="/compare" element={<ComparePage />} />

          {/* Protected routes */}
          <Route path="/my-repos" element={<ProtectedRoute><MyReposPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
