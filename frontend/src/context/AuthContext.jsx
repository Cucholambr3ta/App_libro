import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * Contexto de Autenticación para gestionar el estado de usuario y JWT
 */
const AuthContext = createContext(null);

// URL del API - usa variable de entorno o fallback a localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Cargar usuario al montar el componente si hay token
  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  /**
   * Obtiene los datos del usuario actual desde el backend
   */
  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        // Token inválido, limpiar
        logout();
      }
    } catch (error) {
      console.error('Error al obtener usuario:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Inicia sesión con email y contraseña
   */
  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: 'Error de conexión' };
    }
  };

  /**
   * Registra un nuevo usuario
   */
  const register = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: 'Error de conexión' };
    }
  };

  /**
   * Cierra sesión
   */
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  /**
   * Maneja el callback de autenticación social (Google/Facebook)
   * El token se pasa como query param desde el backend
   */
  const handleSocialCallback = (tokenFromUrl) => {
    localStorage.setItem('token', tokenFromUrl);
    setToken(tokenFromUrl);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    handleSocialCallback,
    isAuthenticated: !!user,
    isPremium: user?.subscriptionStatus === 'premium' || user?.role === 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export default AuthContext;
