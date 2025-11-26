import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import './App.css';

/**
 * Componente de ruta de callback para autenticación social
 */
const AuthCallback = () => {
  const { handleSocialCallback } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Extraer token de la URL
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    
    if (token) {
      handleSocialCallback(token);
      window.location.href = '/';
    }
  }, [location, handleSocialCallback]);

  return (
    <div className="callback-loading">
      <div className="spinner"></div>
      <p>Autenticando...</p>
    </div>
  );
};

/**
 * Router principal de la aplicación
 */
const AppRouter = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  // Manejar ruta de callback social
  if (location.pathname === '/auth/success') {
    return <AuthCallback />;
  }

  return isAuthenticated ? <Dashboard /> : <Login />;
};

/**
 * Aplicación principal
 */
function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
