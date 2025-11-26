import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import RecipeCard from './RecipeCard';
import PremiumBanner from './PremiumBanner';
import './Dashboard.css';

/**
 * Dashboard principal con lista de recetas y lógica de paywall
 */
const Dashboard = () => {
  const { user, logout, isPremium } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga de recetas (en producción esto vendría del backend)
    setTimeout(() => {
      setRecipes([
        {
          id: 1,
          title: 'Pizza Margarita Clásica',
          ingredients: ['Harina', 'Tomate', 'Mozzarella', 'Albahaca'],
          isPremium: false,
          image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400'
        },
        {
          id: 2,
          title: 'Pasta Carbonara Auténtica',
          ingredients: ['Pasta', 'Huevos', 'Panceta', 'Pecorino'],
          isPremium: true,
          image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400'
        },
        {
          id: 3,
          title: 'Sushi Rolls de Lujo',
          ingredients: ['Arroz', 'Salmón', 'Aguacate', 'Nori'],
          isPremium: true,
          image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400'
        },
        {
          id: 4,
          title: 'Ensalada César Fresca',
          ingredients: ['Lechuga', 'Pollo', 'Parmesano', 'Crutones'],
          isPremium: false,
          image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400'
        }
      ]);
      setLoading(false);
    }, 500);
  }, []);

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
