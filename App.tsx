
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

const App: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('aq_admin_session') === 'active';
  });

  const handleLogin = () => {
    setIsAdmin(true);
    localStorage.setItem('aq_admin_session', 'active');
  };

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('aq_admin_session');
  };

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route 
          path="/adminlogin" 
          element={isAdmin ? <Navigate to="/dashboard" /> : <AdminLogin onLogin={handleLogin} />} 
        />
        <Route 
          path="/dashboard" 
          element={isAdmin ? <AdminDashboard onLogout={handleLogout} /> : <Navigate to="/adminlogin" />} 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
