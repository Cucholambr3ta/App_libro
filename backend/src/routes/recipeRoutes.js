const express = require('express');
const router = express.Router();
const { getRecipes, getRecipeById } = require('../controllers/recipeController');
const { protect } = require('../middleware/authMiddleware');

// Obtener todas las recetas (filtradas según suscripción)
router.get('/', protect, getRecipes);

// Obtener una receta específica
router.get('/:id', protect, getRecipeById);

module.exports = router;
