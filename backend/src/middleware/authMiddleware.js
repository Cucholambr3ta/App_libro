const User = require('../models/User');
const jwt = require('jsonwebtoken');

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
 * Middleware para verificar licencia Premium (Paywall).
 * Valida TANTO status COMO fecha de expiración.
 * Admins tienen acceso ilimitado.
 */
exports.checkLicense = async (req, res, next) => {
  try {
    // Admin bypass
    if (req.user && req.user.role === 'admin') {
      return next();
    }

    // Verificar suscripción premium
    if (!req.user || req.user.subscriptionStatus !== 'premium') {
      return res.status(403).json({ 
        message: 'Contenido exclusivo para usuarios Premium',
        upgrade: true
      });
    }

    // CRÍTICO: Verificar fecha de expiración
    const now = new Date();
    const expiry = req.user.subscriptionExpiry;

    // Si no hay fecha de expiración, considerar como vitalicio
    if (!expiry) {
      console.warn(`⚠️ Usuario ${req.user.email} premium sin subscriptionExpiry`);
      return next();
    }

    // Verificar si la suscripción está vigente
    if (expiry < now) {
      // Suscripción expirada - ACTUALIZAR STATUS inmediatamente
      await User.findByIdAndUpdate(req.user.id, {
        subscriptionStatus: 'free'
      });

      return res.status(403).json({ 
        message: 'Su suscripción Premium ha expirado',
        expired: true,
        expiredOn: expiry
      });
    }

    // Suscripción válida
    next();
  } catch (error) {
    console.error('Error en checkLicense:', error);
    res.status(500).json({ message: 'Error verificando licencia' });
  }
};
