const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware para proteger rutas. Verifica el token JWT.
 */
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'No autorizado, token fallido' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'No autorizado, no hay token' });
  }
};

/**
 * Middleware para requerir rol de administrador.
 */
exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'No autorizado, requiere rol de administrador' });
  }
};

/**
 * Middleware para verificar licencia (Paywall).
 * Permite acceso si es admin o tiene suscripción premium.
 */
exports.checkLicense = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.subscriptionStatus === 'premium')) {
    next();
  } else {
    res.status(403).json({ message: 'Contenido exclusivo para usuarios Premium' });
  }
};
