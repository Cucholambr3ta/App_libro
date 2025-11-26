const User = require('../models/User');
const jwt = require('jsonwebtoken');
const passport = require('passport');

/**
 * Generar Token JWT
 * @param {string} id - ID del usuario
 * @returns {string} - Token JWT firmado
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

/**
 * @desc    Registrar nuevo usuario
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verificar si el usuario ya existe
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    // Crear usuario
    user = await User.create({
      email,
      password,
      authProvider: 'local'
    });

    // Generar token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        subscriptionStatus: user.subscriptionStatus
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

/**
 * @desc    Iniciar sesión (Local)
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: 'Error en el servidor', error: err.message });
    }
    if (!user) {
      return res.status(401).json({ message: info.message });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        subscriptionStatus: user.subscriptionStatus
      }
    });
  })(req, res, next);
};

/**
 * @desc    Callback de Google Auth
 * @route   GET /api/auth/google/callback
 * @access  Public
 */
exports.googleCallback = (req, res) => {
  const token = generateToken(req.user._id);
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  res.redirect(`${frontendUrl}/auth/success?token=${token}`);
};

/**
 * @desc    Callback de Facebook Auth
 * @route   GET /api/auth/facebook/callback
 * @access  Public
 */
exports.facebookCallback = (req, res) => {
  const token = generateToken(req.user._id);
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  res.redirect(`${frontendUrl}/auth/success?token=${token}`);
};

/**
 * @desc    Obtener usuario actual
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        subscriptionStatus: user.subscriptionStatus,
        permissions: user.permissions
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
};
