const User = require('../models/User');
const jwt = require('jsonwebtoken');
const passport = require('passport');

/**
 * Generar Token JWT
 * @param {string} id - ID del usuario
 * @param {string} role - Rol del usuario (opcional)
 * @returns {string} - Token JWT firmado
 */
const generateToken = (id, role = 'user') => {
  return jwt.sign(
    { 
      id,
      role,
      iat: Math.floor(Date.now() / 1000)
    }, 
    process.env.JWT_SECRET,
    { expiresIn: '7d' } // Reducido de 30d a 7d
  );
};

/**
 * @desc    Registrar nuevo usuario
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validación de entrada
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'Email inválido' });
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ 
        message: 'La contraseña debe tener al menos 8 caracteres' 
      });
    }

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
    const token = generateToken(user._id, user.role);

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

    const token = generateToken(user._id, user.role);

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
 * @desc    Callback de Google Auth - Platform aware
 * @route   GET /api/auth/google/callback
 * @access  Public
 */
exports.googleCallback = (req, res) => {
  const token = generateToken(req.user._id, req.user.role);
  
  // Detectar plataforma via query param
  const platform = req.query.platform || 'web';
  
  let redirectUrl;
  if (platform === 'mobile') {
    // Redirect para mobile (deep link)
    redirectUrl = `recipebook://auth/success?token=${token}`;
  } else {
    // Redirect para web
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    redirectUrl = `${frontendUrl}/auth/success?token=${token}`;
  }
  
  res.redirect(redirectUrl);
};

/**
 * @desc    Callback de Facebook Auth - Platform aware
 * @route   GET /api/auth/facebook/callback
 * @access  Public
 */
exports.facebookCallback = (req, res) => {
  const token = generateToken(req.user._id, req.user.role);
  
  const platform = req.query.platform || 'web';
  
  let redirectUrl;
  if (platform === 'mobile') {
    redirectUrl = `recipebook://auth/success?token=${token}`;
  } else {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    redirectUrl = `${frontendUrl}/auth/success?token=${token}`;
  }
  
  res.redirect(redirectUrl);
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
        subscriptionExpiry: user.subscriptionExpiry,
        permissions: user.permissions
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
};
