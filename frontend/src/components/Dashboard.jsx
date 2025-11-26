import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import RecipeCard from './RecipeCard';
import PremiumBanner from './PremiumBanner';
import './Dashboard.css';

// URL del API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Dashboard principal con lista de recetas desde API
 */
const Dashboard = () => {
  const { user, logout, isPremium, token } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecipes();
  }, []);

  /**
   * Obtener recetas del backend (ya filtradas por permisos)
   */
  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/recipes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setRecipes(data.recipes);
      } else {
        setError('Error cargando recetas');
        console.error('Error cargando recetas');
      }
    } catch (error) {
      setError('Error de conexión');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="container">
          <div className="header-content">
            <h1 className="gradient-text">Recipe Book</h1>
            <div className="header-actions">
              <div className="user-info">
                <span className="user-email">{user?.email}</span>
                {isPremium && (
                  <span className="badge-premium">Premium</span>
                )}
              </div>
              <button onClick={logout} className="btn btn-secondary">
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Banner de Premium para usuarios free */}
      {!isPremium && <PremiumBanner />}

      {/* Lista de Recetas */}
      <main className="dashboard-main container">
        <div className="recipes-header">
          <h2>Descubre Recetas</h2>
          <p className="text-secondary">
            {isPremium 
              ? 'Acceso total a todas las recetas premium'
              : 'Actualiza a Premium para desbloquear todas las recetas'}
          </p>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>{error}</p>
            <button onClick={fetchRecipes} className="btn btn-primary">
              Reintentar
            </button>
          </div>
        ) : (
          <div className="recipes-grid">
            {recipes.map(recipe => (
              <RecipeCard 
                key={recipe.id} 
                recipe={recipe}
                isLocked={recipe.isPremium && !isPremium}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
