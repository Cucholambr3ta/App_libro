const Recipe = require('../models/Recipe');

/**
 * @desc    Obtener todas las recetas (con filtrado según suscripción)
 * @route   GET /api/recipes
 * @access  Private
 */
exports.getRecipes = async (req, res) => {
  try {
    const userId = req.user.id;
    const isPremium = req.user.subscriptionStatus === 'premium' || 
                      req.user.role === 'admin';

    // Obtener todas las recetas
    let recipes = await Recipe.find();

    // CRÍTICO: Filtrar datos según permisos
    recipes = recipes.map(recipe => {
      const recipeObj = recipe.toObject();

      // Si es receta premium Y usuario es free
      if (recipeObj.isPremium && !isPremium) {
        return {
          id: recipeObj._id,
          title: recipeObj.title,
          isPremium: true,
          image: recipeObj.images?.[0] || null,
          // TEASER: Solo primeros 2 ingredientes
          ingredients: recipeObj.ingredients.slice(0, 2),
          // NO enviar instrucciones completas
          instructions: null,
          teaser: 'Actualiza a Premium para ver la receta completa'
        };
      }

      // Usuario premium O receta gratuita - enviar todo
      return {
        id: recipeObj._id,
        title: recipeObj.title,
        isPremium: recipeObj.isPremium,
        image: recipeObj.images?.[0] || null,
        ingredients: recipeObj.ingredients,
        instructions: recipeObj.instructions
      };
    });

    res.json({ success: true, recipes });
  } catch (error) {
    console.error('Error obteniendo recetas:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

/**
 * @desc    Obtener una receta específica
 * @route   GET /api/recipes/:id
 * @access  Private
 */
exports.getRecipeById = async (req, res) => {
  try {
    const isPremium = req.user.subscriptionStatus === 'premium' || 
                      req.user.role === 'admin';

    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Receta no encontrada' });
    }

    // Verificar acceso si es premium
    if (recipe.isPremium && !isPremium) {
      return res.status(403).json({ 
        message: 'Esta receta es exclusiva para usuarios Premium',
        upgrade: true
      });
    }

    res.json({ success: true, recipe });
  } catch (error) {
    console.error('Error obteniendo receta:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};
