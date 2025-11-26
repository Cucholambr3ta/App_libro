import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { useAuth } from './context/AuthContext';
import './App.css';

function App() {
  const { user, loading, handleSocialCallback, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Manejar callback de autenticación social
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    
    if (token) {
      handleSocialCallback(token);
      navigate('/');
    }
  }, [location, handleSocialCallback, navigate]);

  // Polling para actualización post-pago
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('payment_success') === 'true') {
      let attempts = 0;
      const maxAttempts = 10;
      
      const pollInterval = setInterval(async () => {
        attempts++;
        await refreshUser();
        
        if (user?.subscriptionStatus === 'premium' || attempts >= maxAttempts) {
          clearInterval(pollInterval);
          if (user?.subscriptionStatus === 'premium') {
            alert('¡Bienvenido a Premium! Recargando contenido...');
            window.history.replaceState({}, '', '/');
          }
        }
      }, 2000);

      return () => clearInterval(pollInterval);
    }
  }, [location, refreshUser, user]);

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/auth/success" element={
        <div className="callback-loading">
          <div className="spinner"></div>
          <p>Completando autenticación...</p>
        </div>
      } />
      <Route path="/" element={
        user ? <Dashboard /> : <Login />
      } />
    </Routes>
  );
}

export default App;
