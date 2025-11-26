const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/**
 * Esquema de Usuario para el sistema de autenticación híbrido.
 * Soporta autenticación local y social (Google, Facebook, Apple).
 * Maneja roles (RBAC) y estado de suscripción.
 */
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'El correo electrónico es obligatorio'],
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Por favor agregue un correo electrónico válido'
    ]
  },
  password: {
    type: String,
    select: false // No devolver la contraseña por defecto
  },
  authProvider: {
    type: String,
    enum: ['local', 'google', 'facebook', 'apple'],
    default: 'local'
  },
  providerId: {
    type: String,
    // Solo requerido si no es local, pero difícil de validar en esquema simple sin lógica condicional compleja,
    // se manejará en el controlador.
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  subscriptionStatus: {
    type: String,
    enum: ['free', 'premium'],
    default: 'free'
  },
  subscriptionExpiry: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

/**
 * Virtual para verificar permisos.
 * Retorna un objeto con banderas booleanas basadas en el rol y suscripción.
 */
UserSchema.virtual('permissions').get(function() {
  return {
    canModify: this.role === 'admin',
    canViewPremium: this.role === 'admin' || this.subscriptionStatus === 'premium'
  };
});

/**
 * Middleware pre-save para hashear la contraseña si ha sido modificada.
 */
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Método para comparar contraseñas ingresadas con el hash almacenado.
 * @param {string} enteredPassword - Contraseña ingresada por el usuario.
 * @returns {Promise<boolean>}
 */
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
