import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import googleIcon from '../assets/google-icon.svg';
import facebookIcon from '../assets/facebook-icon.svg';
import './Login.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Componente de Login con soporte para autenticación local y social
 */
const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = isRegister 
      ? await register(email, password)
      : await login(email, password);

    if (!result.success) {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const handleSocialLogin = (provider) => {
    // Redirigir a la ruta de autenticación social del backend
    window.location.href = `${API_URL}/api/auth/${provider}`;
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="gradient-text">Recipe Book</h1>
          <p className="text-secondary">
            {isRegister ? 'Crea tu cuenta' : 'Bienvenido de nuevo'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? (
              <div className="spinner-small"></div>
            ) : (
              isRegister ? 'Registrarse' : 'Iniciar Sesión'
            )}
          </button>
        </form>

        <div className="divider">
          <span>o continúa con</span>
        </div>

        <div className="social-buttons">
          <button 
            className="btn btn-social"
            onClick={() => handleSocialLogin('google')}
          >
            <img src={googleIcon} alt="Google" width="20" height="20" />
            Google
          </button>
          <button 
            className="btn btn-social"
            onClick={() => handleSocialLogin('facebook')}
          >
            <img src={facebookIcon} alt="Facebook" width="20" height="20" />
            Facebook
          </button>
        </div>

        <div className="login-footer">
          <button
            type="button"
            className="link-button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
          >
            {isRegister 
              ? '¿Ya tienes cuenta? Inicia sesión'
              : '¿No tienes cuenta? Regístrate'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
