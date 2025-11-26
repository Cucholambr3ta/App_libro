const mongoose = require('mongoose');

/**
 * Esquema de Receta.
 * Contiene información básica de la receta y bandera de contenido premium.
 */
const RecipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'El título es obligatorio'],
    trim: true
  },
  ingredients: [{
    type: String,
    required: [true, 'Los ingredientes son obligatorios']
  }],
  instructions: {
    type: String,
    required: [true, 'Las instrucciones son obligatorias']
  },
  images: [{
    type: String // URLs de imágenes
  }],
  isPremium: {
    type: Boolean,
    default: false,
    description: 'Determina si la receta es contenido exclusivo para usuarios premium'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Recipe', RecipeSchema);
