import React from 'react';
import './RecipeCard.css';

/**
 * Tarjeta de receta con overlay de "Bloqueado" para contenido premium
 */
const RecipeCard = ({ recipe, isLocked }) => {
  return (
    <div className={`recipe-card ${isLocked ? 'locked' : ''}`}>
      <div className="recipe-image-container">
        <img 
          src={recipe.image} 
          alt={recipe.title}
          className="recipe-image"
        />
        {isLocked && (
          <div className="lock-overlay">
            <svg
              className="lock-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              width="48"
              height="48"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span className="lock-text">Premium</span>
          </div>
        )}
      </div>
      
      <div className="recipe-content">
        <h3 className="recipe-title">{recipe.title}</h3>
        
        <div className="recipe-ingredients">
          {recipe.ingredients.slice(0, 3).map((ingredient, index) => (
            <span key={index} className="ingredient-tag">
              {ingredient}
            </span>
          ))}
          {recipe.ingredients.length > 3 && (
            <span className="ingredient-tag">+{recipe.ingredients.length - 3}</span>
          )}
        </div>

        <button 
          className={`btn ${isLocked ? 'btn-secondary' : 'btn-primary'} btn-full`}
          disabled={isLocked}
        >
          {isLocked ? '🔒 Desbloquear' : 'Ver Receta'}
        </button>
      </div>
    </div>
  );
};

export default RecipeCard;
